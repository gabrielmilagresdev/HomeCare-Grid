import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
export function suspicious(text) {
  return [/gh[pousr]_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/, /xai-[A-Za-z0-9]{20,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/].some(re=>re.test(text));
}
export async function scan(root=process.cwd()) {
  const findings=[];
  // Scan tracked files and unignored candidates. Private local env files are
  // intentionally ignored by Git; a force-added env file is still detected.
  const files=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:root}).toString('utf8').split('\0').filter(Boolean);
  for (const relative of files) {
    const full=path.join(root,relative);
    const stat=await fs.lstat(full).catch(()=>null);
    if (!stat?.isFile() || stat.isSymbolicLink()) continue;
    if (path.basename(relative).startsWith('.env') && path.basename(relative)!=='.env.example') findings.push(relative+' (env privado)');
    else if (suspicious(await fs.readFile(full,'utf8'))) findings.push(relative);
  }
  return findings;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const findings=await scan();
  if(findings.length){console.error('Possíveis segredos em: '+findings.join(', '));process.exitCode=1;}
  else console.log('Scanner heurístico: nenhum padrão detectado nos arquivos do projeto.');
}
