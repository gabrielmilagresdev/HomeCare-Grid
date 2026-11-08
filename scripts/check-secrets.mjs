import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function suspicious(text) {
  return [/gh[pousr]_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/].some(re=>re.test(text));
}
export async function scan(root=process.cwd()) {
  const skip=new Set(['.git','node_modules','.cache','.runtime','dist','coverage','artifacts']);
  const findings=[];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
      if (skip.has(entry.name) || entry.isSymbolicLink()) continue;
      const full=path.join(dir,entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        if (entry.name.startsWith('.env') && entry.name!=='.env.example') findings.push(path.relative(root,full)+' (env privado)');
        else if (suspicious(await fs.readFile(full,'utf8'))) findings.push(path.relative(root,full));
      }
    }
  }
  await walk(root); return findings;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const findings=await scan();
  if(findings.length){console.error('Possíveis segredos em: '+findings.join(', '));process.exitCode=1;}
  else console.log('Scanner heurístico: nenhum padrão detectado nos arquivos do projeto.');
}
