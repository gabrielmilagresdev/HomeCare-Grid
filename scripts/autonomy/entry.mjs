import fs from 'node:fs/promises';
process.env.HCG_MODEL_TOKEN=(await fs.readFile('/run/secrets/model-token','utf8')).trim();
const task=JSON.parse(await fs.readFile('/state/task.json','utf8'));
if(task.mode==='arbiter') {const {runArbiterWorker}=await import('./arbiter-worker.mjs');await runArbiterWorker();}
else {const {runWorker}=await import('./worker.mjs');const result=await runWorker(task);if(!result.ok)process.exitCode=1;}
