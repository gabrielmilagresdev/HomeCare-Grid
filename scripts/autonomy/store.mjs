import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
export class LeaseStore {
  constructor(file, { clock = Date.now, maxAttempts = 2 } = {}) {
    this.clock = clock; this.maxAttempts = maxAttempts;
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS leases(issue INTEGER PRIMARY KEY, actor TEXT NOT NULL, id TEXT NOT NULL,
        fence INTEGER NOT NULL, expires INTEGER, state TEXT NOT NULL, attempts INTEGER NOT NULL, pr INTEGER);
      CREATE TABLE IF NOT EXISTS resources(name TEXT PRIMARY KEY, issue INTEGER NOT NULL REFERENCES leases(issue));
      CREATE TABLE IF NOT EXISTS events(seq INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL,
        issue INTEGER, actor TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS lease_context(lease TEXT PRIMARY KEY,base_sha TEXT NOT NULL,task_hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS reviews(pr INTEGER PRIMARY KEY,actor TEXT NOT NULL,sha TEXT NOT NULL,expires INTEGER NOT NULL,requests INTEGER NOT NULL DEFAULT 0,decision TEXT);
      CREATE TABLE IF NOT EXISTS model_usage(lease TEXT PRIMARY KEY, requests INTEGER NOT NULL DEFAULT 0);
    `);
  }
  transaction(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const result = fn(); this.db.exec('COMMIT'); return result; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  event(issue, actor, action, detail = '') {
    this.db.prepare('INSERT INTO events(at,issue,actor,action,detail) VALUES(?,?,?,?,?)').run(this.clock(),issue,actor,action,detail);
  }
  sweep() {
    const expired=this.db.prepare("SELECT * FROM leases WHERE state='running' AND expires<=?").all(this.clock());
    for(const row of expired) {
      const changed=this.db.prepare("UPDATE leases SET state='quarantined' WHERE issue=? AND state='running' AND expires<=?").run(row.issue,this.clock());
      if(changed.changes)this.event(row.issue,row.actor,'expired','resources retained until process stop and reconciliation');
    }
  }
  claim(issue, actor, resources, ttl = 180000) {
    if(!Number.isSafeInteger(issue)||issue<1||!actor||ttl<1000||ttl>300000)throw new Error('Invalid lease');
    return this.transaction(()=>{
      this.sweep();
      const old=this.get(issue);
      if(old && ['running','review','quarantined','cancelled'].includes(old.state))throw new Error('Issue already reserved; trusted recovery required');
      if(old && old.attempts>=this.maxAttempts)throw new Error('Attempt limit reached');
      const used=this.db.prepare('SELECT name FROM resources').all().map(r=>r.name);
      for(const name of resources)if(used.some(u=>u===name||u.startsWith(name+'/')||name.startsWith(u+'/')))throw new Error('Resource conflict: '+name);
      if(this.db.prepare("SELECT issue FROM leases WHERE actor=? AND state IN ('running','review','quarantined','cancelled')").get(actor))throw new Error('Actor already running');
      const lease={issue,actor,id:randomUUID(),fence:(old?.fence??0)+1,expires:this.clock()+ttl,state:'running',attempts:(old?.attempts??0)+1,pr:null};
      this.db.prepare('INSERT OR REPLACE INTO leases VALUES(?,?,?,?,?,?,?,?)').run(issue,actor,lease.id,lease.fence,lease.expires,lease.state,lease.attempts,null);
      for(const name of new Set(resources))this.db.prepare('INSERT INTO resources VALUES(?,?)').run(name,issue);
      this.event(issue,actor,'claimed','fence='+lease.fence); return lease;
    });
  }
  bind(lease,baseSha,taskHash) {this.assert(lease);this.db.prepare('INSERT INTO lease_context VALUES(?,?,?)').run(lease.id,baseSha,taskHash);}
  binding(lease) {this.assert(lease);const row=this.db.prepare('SELECT * FROM lease_context WHERE lease=?').get(lease.id);if(!row)throw new Error('Immutable task context missing');return row;}
  resume(issue,actor,ttl=180000) {
    return this.transaction(()=>{const row=this.get(issue);
      if(!row||row.actor!==actor||row.state!=='review'||!row.pr||row.attempts>=this.maxAttempts)throw new Error('Review is not resumable or attempt limit reached');
      if(this.db.prepare("SELECT issue FROM leases WHERE actor=? AND state='running'").get(actor))throw new Error('Actor already running');
      this.db.prepare("UPDATE leases SET id=?,fence=fence+1,expires=?,state='running',attempts=attempts+1 WHERE issue=?").run(randomUUID(),this.clock()+ttl,issue);
      this.event(issue,actor,'resumed','pr='+row.pr);return this.get(issue);});
  }
  get(issue) { return this.db.prepare('SELECT * FROM leases WHERE issue=?').get(issue); }
  assert(lease) {
    this.sweep(); const row=this.get(lease.issue);
    if(!row||row.id!==lease.id||row.fence!==lease.fence||row.actor!==lease.actor||row.state!=='running'||row.expires<=this.clock())throw new Error('Stale or inactive lease');
    return row;
  }
  renew(lease, ttl = 180000) {
    if(ttl<1000||ttl>300000)throw new Error('Invalid TTL');
    return this.transaction(()=>{this.assert(lease);const expires=this.clock()+ttl;this.db.prepare('UPDATE leases SET expires=? WHERE issue=?').run(expires,lease.issue);this.event(lease.issue,lease.actor,'renewed');return {...this.get(lease.issue)};});
  }
  review(lease, pr) {
    return this.transaction(()=>{this.assert(lease);this.db.prepare("UPDATE leases SET state='review',expires=NULL,pr=? WHERE issue=?").run(pr,lease.issue);this.event(lease.issue,lease.actor,'awaiting-review','pr='+pr);return this.get(lease.issue);});
  }
  cancel(lease) {
    return this.transaction(()=>{this.assert(lease);this.db.prepare("UPDATE leases SET state='cancelled' WHERE issue=?").run(lease.issue);this.event(lease.issue,lease.actor,'cancelled','stop executor before recovery');});
  }
  recover(issue, actor, { executionStopped, remoteReconciled, reason } = {}) {
    if(!executionStopped||!remoteReconciled||!reason)throw new Error('Recovery requires stopped execution and remote reconciliation');
    return this.transaction(()=>{const row=this.get(issue);if(!row||!['quarantined','cancelled'].includes(row.state))throw new Error('Not recoverable');
      this.db.prepare('DELETE FROM resources WHERE issue=?').run(issue);
      this.db.prepare("UPDATE leases SET state='released',expires=NULL,fence=fence+1 WHERE issue=?").run(issue);
      this.event(issue,actor,'recovered',String(reason).slice(0,200));return this.get(issue);});
  }
  complete(issue, actor, { merged, integrationVerified } = {}) {
    if(!merged||!integrationVerified)throw new Error('Integration evidence required');
    return this.transaction(()=>{const row=this.get(issue);if(!row||row.state!=='review')throw new Error('Not in review');
      this.db.prepare('DELETE FROM resources WHERE issue=?').run(issue);
      this.db.prepare("UPDATE leases SET state='complete' WHERE issue=?").run(issue);
      this.event(issue,actor,'complete');return this.get(issue);});
  }
  modelRequest(lease, max = 60) {
    return this.transaction(()=>{this.assert(lease);this.db.prepare('INSERT OR IGNORE INTO model_usage VALUES(?,0)').run(lease.id);
      const row=this.db.prepare('SELECT requests FROM model_usage WHERE lease=?').get(lease.id);
      if(row.requests>=max)throw new Error('Model request limit reached');
      this.db.prepare('UPDATE model_usage SET requests=requests+1 WHERE lease=?').run(lease.id);return row.requests+1;});
  }
  beginReview(pr,sha,actor) {
    if(!Number.isSafeInteger(pr)||pr<1||!/^[a-f0-9]{40}$/.test(sha)||actor!=='lucas-arbiter')throw new Error('Invalid review session');
    return this.transaction(()=>{const running=this.db.prepare('SELECT pr FROM reviews WHERE actor=? AND expires>?').all(actor,this.clock());
      if(running.some(r=>r.pr!==pr))throw new Error('Arbiter already reviewing');
      this.db.prepare('INSERT OR REPLACE INTO reviews VALUES(?,?,?,?,0,NULL)').run(pr,actor,sha,this.clock()+5400000);
      this.event(null,actor,'review-started','pr='+pr+' sha='+sha);return this.db.prepare('SELECT * FROM reviews WHERE pr=?').get(pr);});
  }
  reviewModel(max=60) {
    return this.transaction(()=>{const row=this.db.prepare("SELECT * FROM reviews WHERE actor='lucas-arbiter' AND expires>? AND decision IS NULL").get(this.clock());
      if(!row||row.requests>=max)throw new Error('Active bounded arbiter review required');
      this.db.prepare('UPDATE reviews SET requests=requests+1 WHERE pr=?').run(row.pr);return row;});
  }
  decision(pr,result) {
    return this.transaction(()=>{const row=this.db.prepare('SELECT * FROM reviews WHERE pr=?').get(pr);
      if(!row||row.expires<=this.clock()||result.sha!==row.sha||!['APPROVED','CHANGES REQUESTED','BLOCKED','REVIEW INCOMPLETE'].includes(result.verdict)||!Array.isArray(result.findings)||result.findings.some(f=>typeof f!=='string')||typeof result.analysis!=='string'||result.analysis.length<40)throw new Error('Invalid/stale arbiter analysis');
      this.db.prepare('UPDATE reviews SET decision=? WHERE pr=?').run(JSON.stringify(result),pr);
      this.event(null,'lucas-arbiter','review-decision','pr='+pr+' '+result.verdict);return result;});
  }
  approved(pr,sha) {const row=this.db.prepare('SELECT * FROM reviews WHERE pr=?').get(pr);return Boolean(row&&row.expires>this.clock()&&row.sha===sha&&row.decision&&JSON.parse(row.decision).verdict==='APPROVED');}
  status() { this.sweep();return {leases:this.db.prepare('SELECT * FROM leases ORDER BY issue').all(),resources:this.db.prepare('SELECT * FROM resources ORDER BY name').all()}; }
  audit() { return this.db.prepare('SELECT * FROM events ORDER BY seq').all(); }
  close() { this.db.close(); }
}
