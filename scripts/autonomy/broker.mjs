import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import { roleOf, eligible, readiness, validProtection, validExclusiveRule, dependenciesFor, resourcesFor } from './policy.mjs';
const taskHash=issue=>createHash('sha256').update(JSON.stringify([issue.title,issue.body])).digest('hex');
const hash=value=>createHash('sha256').update(value).digest();
const equal=(a,b)=>Boolean(a&&b)&&timingSafeEqual(hash(a),hash(b));
export function authenticate(token, secrets, kind='control') {
  const found=Object.entries(secrets).find(([,entry])=>equal(token,entry[kind]));
  if(!found)throw new Error('AUTHENTICATION_REQUIRED');
  return found[0];
}
export function validateSecrets(secrets) {
  const values=Object.values(secrets).flatMap(v=>[v.control,v.model]);
  if(values.some(v=>typeof v!=='string'||v.length<32)||new Set(values).size!==values.length)throw new Error('All control/model credentials must be distinct and >=32 characters');
}
export class Broker {
  constructor({config,store,clients,secrets,context}) {validateSecrets(secrets);Object.assign(this,{config,store,clients,secrets,context});}
  actor(id) {const actor=this.config.actors.find(a=>a.id===id);if(!actor)throw new Error('Unknown actor');return actor;}
  async handle(id, operation, input={}) {
    const actor=this.actor(id),client=this.clients[id];
    if(operation==='status') {const state=this.store.status();return roleOf(id)==='arbiter'?state:{leases:state.leases.filter(l=>l.actor===id),resources:state.resources.filter(r=>state.leases.some(l=>l.issue===r.issue&&l.actor===id))};}
    if(operation==='preflight')return this.preflight();
    if(operation==='pilotcheck')return this.pilotcheck();
    if(operation==='queue') {
      if(roleOf(id)!=='arbiter')throw new Error('ARBITER_ONLY');
      const prs=await client.pages('pulls?state=open');
      return prs.filter(pr=>!pr.draft&&['develop','main'].includes(pr.base.ref)&&this.config.actors.some(a=>roleOf(a.id)==='operational'&&a.githubLogin===pr.user.login)).map(pr=>({number:pr.number,title:pr.title,sha:pr.head.sha,base:pr.base.ref}));
    }
    if(operation==='inspect') {
      if(roleOf(id)!=='arbiter')throw new Error('ARBITER_ONLY');
      const data=await client.inspectPR(input.pr);
      data.issue=await client.issue(Number((data.pr.body??'').match(/^Refs #([1-9]\\d*)\\s*$/m)?.[1]));
      data.checks=await client.api('commits/'+data.pr.head.sha+'/check-runs?per_page=100');
      data.dependencies=this.context.contracts;
      const session=this.store.beginReview(input.pr,data.pr.head.sha,id);
      return {...data,session,notice:'Inspect every file/diff, tests and architecture; automated analysis is not independent human approval.'};
    }
    if(operation==='decision') {if(roleOf(id)!=='arbiter')throw new Error('ARBITER_ONLY');const result=this.store.decision(input.pr,input.result);return result;}
    if(operation==='merge') {
      if(roleOf(id)!=='arbiter')throw new Error('MERGE_FORBIDDEN_FOR_OPERATOR');
      const record=await client.api('pulls/'+input.pr);
      const ready=record.head.ref==='feature/58-gabriel-operational'?await this.pilotcheck():await this.preflight();if(!ready.ready)throw new Error(ready.verdict+': '+ready.blockers.join('; '));
      if(!this.store.approved(input.pr,input.sha))throw new Error('Current APPROVED arbiter analysis missing');
      const pr=await client.api('pulls/'+input.pr);
      const author=this.config.actors.find(a=>a.githubLogin===pr.user.login);if(!author||roleOf(author.id)!=='operational')throw new Error('Logical author missing');
      return client.merge(input.pr,input.sha,author);
    }
    if(roleOf(id)!=='operational')throw new Error('OPERATOR_ONLY');
    if(operation==='ready') {
      const row=this.store.get(input.issue);if(!row||row.actor!==id||row.state!=='review'||!row.pr)throw new Error('Owned PR in review required');
      return client.ready(row.pr);
    }
    if(operation==='tasks') {
      const {plan,map}=this.context.contracts,issues=await client.pages('issues?state=open');
      const results=[];for(const issue of issues){if(issue.pull_request)continue;const result=await eligible(issue,actor,{plan,map,readIssue:n=>client.issue(n)});if(result.ready)results.push({number:issue.number,title:issue.title,...result});}
      return results;
    }
    if(operation==='pilot'||operation==='resume'||operation==='claim') {
      const pilot=input.issue===58;
      if(operation==='pilot'&&(!pilot||id!=='gabriel-operational'))throw new Error('Pilot limited to Gabriel Issue #58');
      if(pilot&&operation==='claim')throw new Error('Use explicit single-agent pilot command');
      if(operation==='resume') {
        const row=this.store.get(input.issue);if(!row||row.actor!==id||!row.pr)throw new Error('Owned review reservation required');
        const ready=pilot?await this.pilotcheck():await this.preflight();if(!ready.ready)throw new Error(ready.blockers.join('; '));
        const issue=await client.issue(input.issue),result=await this.taskEligibility(issue,actor,['status:changes-requested']);
        if(!result.ready)throw new Error(result.reasons.join('; '));
        const pr=await client.api('pulls/'+row.pr);
        if(pr.state!=='open'||pr.user.login!==actor.githubLogin||pr.head.ref!=='feature/'+issue.number+'-'+id)throw new Error('Resume PR ownership mismatch');
        const lease=this.store.resume(issue.number,id,this.config.leaseSeconds*1000);
        this.store.bind(lease,pr.head.sha,taskHash(issue));
        await client.status(issue.number,'in-progress');
        return {lease,issue,scopes:result.scopes,baseSha:pr.head.sha,branch:pr.head.ref};
      }
      const ready=pilot?await this.pilotcheck():await this.preflight();if(!ready.ready)throw new Error(ready.verdict+': '+ready.blockers.join('; '));
      const issue=await client.issue(input.issue);
      const result=await this.taskEligibility(issue,actor,['status:ready']);
      if(!result.ready)throw new Error(result.reasons.join('; '));
      const lease=this.store.claim(issue.number,id,result.resources,this.config.leaseSeconds*1000);
      this.store.bind(lease,this.context.baseSha,taskHash(issue));
      try {await client.status(issue.number,'in-progress');}catch(error){this.store.cancel(lease);throw error;}
      return {lease,issue,scopes:result.scopes,baseSha:this.context.baseSha,branch:'feature/'+issue.number+'-'+id};
    }
    if(!input.lease||input.lease.actor!==id)throw new Error('Lease ownership mismatch');
    this.store.assert(input.lease);
    if(operation==='snapshot')return client.snapshot(this.store.binding(input.lease).base_sha);
    if(operation==='renew')return this.store.renew(input.lease,this.config.leaseSeconds*1000);
    if(operation==='cancel')return this.store.cancel(input.lease);
    if(operation==='publish') {
      const ready=input.lease.issue===58?await this.pilotcheck():await this.preflight();if(!ready.ready)throw new Error('Readiness changed; publication blocked');
      const currentIssue=await client.issue(input.lease.issue),binding=this.store.binding(input.lease);
      if(taskHash(currentIssue)!==binding.task_hash)throw new Error('Task changed after reservation; stop and reconcile');
      const result=await this.taskEligibility(currentIssue,actor,['status:in-progress','status:changes-requested']);
      if(!result.ready)throw new Error(result.reasons.join('; '));
      const row=this.store.get(input.lease.issue),baseSha=binding.base_sha;
      this.store.assert(input.lease);
      const pr=await client.publish({...input,lease:row,scopes:result.scopes,baseSha,branch:'feature/'+input.lease.issue+'-'+id});
      this.store.review(input.lease,pr.number);await client.status(input.lease.issue,'in-review');return pr;
    }
    throw new Error('Operation not exposed');
  }
  async taskEligibility(issue,actor,statuses) {
    const client=this.clients[actor.id];
    if(issue.number!==58)return eligible(issue,actor,{...this.context.contracts,readIssue:n=>client.issue(n),statuses});
    const labels=issue.labels.map(l=>l.name),reasons=[];
    if(actor.id!=='gabriel-operational'||issue.state!=='open'||issue.pull_request||!labels.includes('owner:gabriel')||!labels.includes('agent:operational')||!statuses.includes(labels.filter(l=>l.startsWith('status:')).join()))reasons.push('Pilot ownership/status invalid');
    const deps=new Set([56,...dependenciesFor(issue,{stories:[]},{})]);
    for(const n of deps){const dep=await client.issue(n);if(dep.state!=='closed'||dep.state_reason!=='completed'||!dep.labels.some(l=>l.name==='integration:verified'))reasons.push('Pilot dependency #'+n+' not accepted');}
    const scopes=['docs/audit/autonomy-pilot-result.md','tests/autonomy-pilot.test.mjs'];
    return {ready:!reasons.length,reasons,scopes,resources:resourcesFor(scopes)};
  }
  async exclusiveRule() {return this.config.exclusiveRulesetId?this.clients['lucas-arbiter'].api('rulesets/'+this.config.exclusiveRulesetId):null;}
  async baseFresh() {const ref=await this.clients['lucas-arbiter'].api('git/ref/heads/'+(this.config.baseBranch??'develop'));return ref.object.sha===this.context.baseSha;}
  async pilotcheck() {
    const rule=await this.clients['lucas-arbiter'].api('rulesets/'+this.config.rulesetId),evidence=this.context.evidence,blockers=[];
    if(!validProtection(rule))blockers.push('Native protection incomplete');
    if(!validExclusiveRule(await this.exclusiveRule(),this.config.arbiterAppId))blockers.push('Native merge restriction to arbiter App is absent');
    if(!await this.baseFresh())blockers.push('Integration base changed; refresh reviewed evidence and restart broker');
    if(!this.context.dockerAvailable||!this.context.providerAvailable||!this.config.model)blockers.push('Docker/model provider not proven');
    if(!Number.isFinite(evidence?.expiresAt)||evidence.expiresAt<=Date.now())blockers.push('Pilot prerequisite evidence absent/expired');
    for(const gate of ['credentials','isolatedContainers','networkIsolation'])if(evidence?.gates?.[gate]!==true||!evidence.proofs?.[gate])blockers.push('Unproven prerequisite: '+gate);
    if(new Set(this.config.actors.map(a=>a.githubLogin).filter(Boolean)).size!==5)blockers.push('Five distinct identities missing');
    return {ready:!blockers.length,verdict:blockers.length?'NOT READY — BLOCKERS REMAIN':'SINGLE-AGENT PILOT ONLY',blockers};
  }
  async preflight() {
    const client=this.clients['lucas-arbiter'];
    const rule=await client.api('rulesets/'+this.config.rulesetId);
    let foundation=true;
    for(const n of [2,17]){const i=await client.issue(n);if(i.state!=='closed'||i.state_reason!=='completed'||!i.labels.some(l=>l.name==='integration:verified'))foundation=false;}
    const result=readiness({rule,exclusiveRule:await this.exclusiveRule(),arbiterAppId:this.config.arbiterAppId,evidence:this.context.evidence,actors:this.config.actors,foundation,dockerAvailable:this.context.dockerAvailable});
    if(!await this.baseFresh()){result.ready=false;result.verdict='NOT READY — BLOCKERS REMAIN';result.blockers.push('Integration base changed; refresh reviewed evidence and restart broker');}
    if(!this.context.providerAvailable||!this.config.model){result.ready=false;result.verdict='NOT READY — BLOCKERS REMAIN';result.blockers.push('Model provider unavailable');}return result;
  }
}
export function httpHandler(broker,{openaiKey,adminKey,request=fetch}={}) {
  return async(req,res)=>{
    const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    try {
      if(req.method==='GET'&&req.url==='/health')return send(200,{service:'homecare-grid-broker',ready:false,detail:'Use authenticated preflight'});
      if(req.method!=='POST')return send(405,{error:'POST only'});
      const token=(req.headers.authorization??'').replace(/^Bearer /,'');
      const model=req.url==='/v1/responses';
      const admin=req.url?.startsWith('/admin/');
      if(admin&&!equal(token,adminKey))throw new Error('AUTHENTICATION_REQUIRED');
      const id=admin?'admin':authenticate(token,broker.secrets,model?'model':'control');
      let body='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>1048576)throw new Error('Request size limit');body+=chunk;}
      const data=JSON.parse(body||'{}');
      if(admin) {
        if(req.url==='/admin/recover')return send(200,broker.store.recover(data.issue,'admin',data));
        if(req.url==='/admin/complete') {const row=broker.store.get(data.issue);if(!row?.pr)throw new Error('Review record absent');const client=broker.clients['lucas-arbiter'];const pr=await client.api('pulls/'+row.pr),issue=await client.issue(data.issue);return send(200,broker.store.complete(data.issue,'admin',{merged:pr.merged===true,integrationVerified:issue.state==='closed'&&issue.state_reason==='completed'&&issue.labels.some(l=>l.name==='integration:verified')}));}
        throw new Error('Admin endpoint not exposed');
      }
      if(model) {
        if(!openaiKey||!broker.config.model||data.model!==broker.config.model)throw new Error('Configured model provider unavailable or model mismatch');
        if(id==='lucas-arbiter')broker.store.reviewModel(broker.config.modelMaxRequests);
        else {const rows=broker.store.status().leases.filter(l=>l.actor===id&&l.state==='running');if(rows.length!==1)throw new Error('Model access requires one active lease');broker.store.modelRequest(rows[0],broker.config.modelMaxRequests);}
        const upstream=await request('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+openaiKey,'Content-Type':'application/json'},body,signal:AbortSignal.timeout(120000)});
        res.writeHead(upstream.status,{'Content-Type':upstream.headers.get('content-type')??'application/json','Cache-Control':'no-store'});
        Readable.fromWeb(upstream.body).pipe(res);return;
      }
      const match=/^\/control\/([a-z]+)$/.exec(req.url??'');if(!match)throw new Error('Endpoint not exposed');
      const result=await broker.handle(id,match[1],data);send(200,result??{ok:true});
    } catch(error) {
      // Never log request payload, Authorization, provider key or upstream body.
      if(!res.headersSent)send(/AUTHENTICATION/.test(error.message)?401:403,{error:error.message});
      else res.destroy();
    }
  };
}
export function serve(broker,options={}) {
  const server=createServer(httpHandler(broker,options));
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(options.port??8080,options.host??'127.0.0.1',()=>resolve(server));});
}
