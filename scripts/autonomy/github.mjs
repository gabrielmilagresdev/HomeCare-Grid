import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';
import { evaluatePullRequest, FOUNDATION_BASELINE, FOUNDATION_PROMOTION } from '../pr-policy.mjs';
import { independentHumanApproval, REQUIRED_CHECKS, roleOf, withinScope, validProtection, validExclusiveRule } from './policy.mjs';
const REPOSITORY='gabrielmilagresdev/HomeCare-Grid';
export class GitHub {
  constructor(actor, config, {env=process.env, request=fetch, clock=Date.now}={}) {this.actor=actor;this.config=config;this.env=env;this.request=request;this.clock=clock;}
  async token() {
    if(this.actor.app) {
      if(this.cachedToken&&this.cachedUntil>this.clock()+60000)return this.cachedToken;
      const key=this.env[this.actor.app.privateKeyEnv];if(!key)throw new Error('Dedicated GitHub App private key missing');
      const enc=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
      const unsigned=enc({alg:'RS256',typ:'JWT'})+'.'+enc({iat:Math.floor(this.clock()/1000)-60,exp:Math.floor(this.clock()/1000)+540,iss:this.actor.app.id});
      const jwt=unsigned+'.'+createSign('RSA-SHA256').update(unsigned).sign(key,'base64url');
      const response=await this.request('https://api.github.com/app/installations/'+this.actor.app.installationId+'/access_tokens',{
        method:'POST',headers:{Authorization:'Bearer '+jwt,Accept:'application/vnd.github+json','Content-Type':'application/json'},
        body:JSON.stringify({repositories:['HomeCare-Grid'],permissions:{contents:'write',pull_requests:'write',issues:'write',checks:'read'}}),signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw new Error('GitHub App token exchange HTTP '+response.status);
      const data=await response.json();this.cachedToken=data.token;this.cachedUntil=Date.parse(data.expires_at);return data.token;
    }
    const value=this.env[this.actor.githubTokenEnv];if(!value)throw new Error('Dedicated GitHub credential missing for '+this.actor.id);return value;
  }
  async api(resource, {method='GET',body}={}) {
    if(this.config.repository!==REPOSITORY||resource.includes('..')||resource.startsWith('/'))throw new Error('Repository boundary violation');
    const response=await this.request('https://api.github.com/repos/'+REPOSITORY+'/'+resource,{
      method,headers:{Authorization:'Bearer '+await this.token(),Accept:'application/vnd.github+json','Content-Type':'application/json'},
      ...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('GitHub HTTP '+response.status+' at '+resource.split('?')[0]);
    return response.status===204?null:response.json();
  }
  async identity() {
    if(this.actor.app) {
      if(!this.actor.githubLogin?.endsWith('[bot]'))throw new Error('Configure verified App bot login');
      // Publication verifies the actual PR author too; never infer a bot identity from two different prompts.
      return {login:this.actor.githubLogin,kind:'app',requiresPublicationProof:true};
    }
    const response=await this.request('https://api.github.com/user',{headers:{Authorization:'Bearer '+await this.token(),Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('GitHub identity HTTP '+response.status);
    const user=await response.json();if(user.login!==this.actor.githubLogin)throw new Error('GitHub identity mismatch');
    return {login:user.login,kind:'user'};
  }
  async pages(resource) {
    const result=[];for(let page=1;page<=20;page++){const data=await this.api(resource+(resource.includes('?')?'&':'?')+'per_page=100&page='+page);result.push(...data);if(data.length<100)return result;}throw new Error('Pagination limit reached');
  }
  issue(number) {return this.api('issues/'+number);}
  async status(number,status) {const issue=await this.issue(number);return this.api('issues/'+number,{method:'PATCH',body:{labels:[...issue.labels.map(l=>l.name).filter(n=>!n.startsWith('status:')),'status:'+status]}});}
  async contracts(ref) {
    const read=async name=>{const value=await this.api('contents/docs/agile/'+name+'?ref='+ref);return JSON.parse(Buffer.from(value.content,'base64').toString('utf8'));};
    return {plan:await read('backlog.json'),map:await read('github-map.json')};
  }
  async snapshot(ref) {
    if(!/^[a-f0-9]{40}$/.test(ref))throw new Error('Immutable base required');
    const commit=await this.api('git/commits/'+ref),tree=await this.api('git/trees/'+commit.tree.sha+'?recursive=1');
    if(tree.truncated||tree.tree.length>1000)throw new Error('Snapshot exceeds reviewed limits');
    const files=[];let total=0;
    for(const entry of tree.tree) {
      if(entry.type==='tree')continue;
      if(entry.type!=='blob'||!['100644','100755'].includes(entry.mode)||entry.size>2097152)throw new Error('Unsupported snapshot entry');
      const blob=await this.api('git/blobs/'+entry.sha);
      total+=blob.size;if(total>20971520||blob.encoding!=='base64')throw new Error('Snapshot exceeds reviewed limits');
      files.push({path:entry.path,mode:entry.mode,content:blob.content});
    }
    return {ref,files};
  }
  async publish({lease,files,scopes,baseSha,branch,summary}) {
    if(roleOf(this.actor.id)!=='operational'||lease.actor!==this.actor.id)throw new Error('Operational publication only');
    if(branch!=='feature/'+lease.issue+'-'+this.actor.id)throw new Error('Branch ownership violation');
    if(!/^[a-f0-9]{40}$/.test(baseSha)||!files.length||files.length>100)throw new Error('Invalid publication');
    for(const file of files) {
      if(!withinScope(file.path,scopes)||typeof file.content!=='string'||Buffer.byteLength(file.content)>1048576)throw new Error('Publication outside scope or limit');
      if(file.mode&&file.mode!=='100644')throw new Error('Symlinks/executable artifacts not allowed');
    }
    const base=await this.api('git/commits/'+baseSha);
    let existing;
    if(lease.pr) {
      existing=await this.api('pulls/'+lease.pr);
      if(existing.state!=='open'||existing.user.login!==this.actor.githubLogin||existing.head.ref!==branch||existing.head.sha!==baseSha)throw new Error('Resumed branch/PR changed; reconcile before retry');
    } else await this.api('git/refs',{method:'POST',body:{ref:'refs/heads/'+branch,sha:baseSha}});
    const tree=await this.api('git/trees',{method:'POST',body:{base_tree:base.tree.sha,tree:files.map(file=>({path:file.path,mode:'100644',type:'blob',content:file.content}))}});
    const commit=await this.api('git/commits',{method:'POST',body:{message:'feat(#'+lease.issue+'): '+summary.slice(0,100),tree:tree.sha,parents:[baseSha]}});
    await this.api('git/refs/heads/'+branch,{method:'PATCH',body:{sha:commit.sha,force:false}});
    const pr=existing??await this.api('pulls',{method:'POST',body:{base:'develop',head:branch,title:'[AGENT '+this.actor.id+'] '+summary.slice(0,120),body:'Refs #'+lease.issue+'\n\n'+summary+'\n\nAutomated operational publication. Independent review and current CI required. No merge performed.',draft:true}});
    if(pr.user.login!==this.actor.githubLogin)throw new Error('Publication actor does not match configured identity; PR kept Draft');
    return {number:pr.number,url:pr.html_url,sha:commit.sha};
  }
  async inspectPR(number) {
    const pr=await this.api('pulls/'+number);
    const files=await this.pages('pulls/'+number+'/files');if(files.length>100)throw new Error('Review requires manual handling: over 100 files');
    let total=0;
    const read=async(file,ref)=>{const value=await this.api('contents/'+encodeURIComponent(file).replaceAll('%2F','/')+'?ref='+ref);
      if(value.encoding!=='base64'||value.size>2097152||(total+=value.size)>20971520)throw new Error('Complete review content unavailable; manual review required');
      const bytes=Buffer.from(value.content,'base64');if(bytes.includes(0))throw new Error('Binary change requires manual review');
      return bytes.toString('utf8');};
    for(const file of files) {
      file.before=file.status==='added'?null:await read(file.previous_filename??file.filename,pr.base.sha);
      file.after=file.status==='removed'?null:await read(file.filename,pr.head.sha);
    }
    return {pr,files,reviews:await this.pages('pulls/'+number+'/reviews')};
  }
  async feedback(number) {
    const data={reviews:await this.pages('pulls/'+number+'/reviews'),inline:await this.pages('pulls/'+number+'/comments'),conversation:await this.pages('issues/'+number+'/comments')};
    if(JSON.stringify(data).length>100000)throw new Error('Feedback exceeds automatic review limit; manual reconciliation required');
    return data;
  }
  async ready(number) {
    if(roleOf(this.actor.id)!=='operational')throw new Error('Operational publication only');
    const pr=await this.api('pulls/'+number);
    if(pr.user.login!==this.actor.githubLogin||pr.base.ref!=='develop'||!pr.head.ref.endsWith('-'+this.actor.id))throw new Error('PR ownership mismatch');
    const checks=await this.api('commits/'+pr.head.sha+'/check-runs?per_page=100');
    const latest=new Map();for(const check of checks.check_runs)if(!latest.has(check.name)||latest.get(check.name).id<check.id)latest.set(check.name,check);
    if(checks.total_count>100||REQUIRED_CHECKS.some(n=>latest.get(n)?.status!=='completed'||latest.get(n)?.conclusion!=='success'||latest.get(n)?.app?.id!==15368))throw new Error('Current CI must pass before Ready for review');
    if(!pr.draft)return {number,readyForReview:true,sha:pr.head.sha};
    const response=await this.request('https://api.github.com/graphql',{method:'POST',headers:{Authorization:'Bearer '+await this.token(),'Content-Type':'application/json'},
      body:JSON.stringify({query:'mutation($id:ID!){markPullRequestReadyForReview(input:{pullRequestId:$id}){pullRequest{id isDraft}}}',variables:{id:pr.node_id}}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Ready mutation HTTP '+response.status);
    const data=await response.json();if(data.errors||data.data?.markPullRequestReadyForReview?.pullRequest?.isDraft!==false)throw new Error('Ready mutation not confirmed');
    return {number,readyForReview:true,sha:pr.head.sha};
  }
  async merge(number, expectedSha, logicalAuthor) {
    if(roleOf(this.actor.id)!=='arbiter')throw new Error('MERGE_FORBIDDEN_FOR_OPERATOR');
    const {pr,reviews}=await this.inspectPR(number);
    if(pr.user.login!==logicalAuthor.githubLogin)throw new Error('Logical author identity mismatch');
    if(pr.draft||pr.state!=='open'||pr.head.sha!==expectedSha||pr.user.login===this.actor.githubLogin)throw new Error('PR is not an independently authored current candidate');
    const contracts=await this.contracts(pr.base.ref==='main'&&pr.base.sha===FOUNDATION_PROMOTION.initialMain?FOUNDATION_BASELINE:pr.base.sha);
    const foundationComparison=pr.base.ref==='main'&&pr.number===FOUNDATION_PROMOTION.pr&&pr.head.sha!==FOUNDATION_BASELINE?await this.api('compare/'+FOUNDATION_BASELINE+'...'+pr.head.sha):undefined;
    const evaluated=await evaluatePullRequest({pr,repository:REPOSITORY,readIssue:n=>this.issue(n),plan:contracts.plan,issueMap:contracts.map,foundationComparison});
    if(evaluated.errors.length)throw new Error(evaluated.errors.join('; '));
    const rule=await this.api('rulesets/'+this.config.rulesetId);
    if(!validProtection(rule))throw new Error('Native protection incomplete');
    if(!this.config.exclusiveRulesetId||!validExclusiveRule(await this.api('rulesets/'+this.config.exclusiveRulesetId),this.config.arbiterAppId))throw new Error('Native arbiter-only update rule missing');
    if(!independentHumanApproval(reviews,pr,logicalAuthor,this.config.humanReviewers))throw new Error('Independent HUMAN approval missing for exact SHA');
    const checkRuns=[];
    for(let page=1;page<=20;page++) {
      const checks=await this.api('commits/'+expectedSha+'/check-runs?per_page=100&page='+page);
      checkRuns.push(...checks.check_runs);if(checks.check_runs.length<100)break;
      if(page===20)throw new Error('Check pagination limit reached');
    }
    const latest=new Map();for(const check of checkRuns)if(!latest.has(check.name)||check.id>latest.get(check.name).id)latest.set(check.name,check);
    if(REQUIRED_CHECKS.some(name=>latest.get(name)?.status!=='completed'||latest.get(name)?.conclusion!=='success'||latest.get(name)?.app?.id!==15368))throw new Error('Required current checks not successful');
    if(pr.mergeable_state!=='clean')throw new Error('Mergeability, conversations or update requirements not satisfied');
    // GitHub performs the final policy/race check and exact SHA compare; no admin bypass.
    return this.api('pulls/'+number+'/merge',{method:'PUT',body:{sha:expectedSha,merge_method:'merge'}});
  }
}
