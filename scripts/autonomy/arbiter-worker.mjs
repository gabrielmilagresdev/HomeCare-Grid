import fs from 'node:fs/promises';
import { boundedProcess, checkpoint } from './process.mjs';
export async function runArbiterWorker() {
  const packet=JSON.parse(await fs.readFile('/state/review.json','utf8'));
  const prompt='You are Lucas Arbiter. Read /state/review.json in FULL: Issue, all before/after files, CI and reviews. Analyze architecture, contracts, security, concurrency, acceptance, regressions, isolation, scope, accessibility and tests. Never infer success from unchecked evidence. Bot analysis does not replace independent human approval. If evidence is absent return BLOCKED or REVIEW INCOMPLETE. Return exact current SHA and detailed findings using the output schema. Do not edit source or merge.';
  const result=await boundedProcess('codex',['exec','--strict-config','--sandbox','workspace-write','--json','--ephemeral','--output-schema','/opt/hcg/infra/autonomy/arbiter-result.schema.json','--output-last-message','/state/result.json',prompt],{
    cwd:'/workspace',timeoutMs:5400000,logFile:'/state/arbiter.jsonl',secretValues:[process.env.HCG_MODEL_TOKEN],
    env:{CODEX_HOME:'/state/codex',HCG_MODEL_TOKEN:process.env.HCG_MODEL_TOKEN,HOME:'/state',TMPDIR:'/tmp'}
  });
  if(!result.ok)throw new Error('Arbiter process failed');
  const decision=JSON.parse(await fs.readFile('/state/result.json','utf8'));
  if(decision.sha!==packet.pr.head.sha)throw new Error('Analysis SHA mismatch');
  await checkpoint('/state',{phase:'reviewed',sha:decision.sha});return decision;
}
