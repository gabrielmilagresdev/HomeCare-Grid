import fs from 'node:fs';
export function validateConfig(text) {
  const wanted={
    'approval_policy':'"never"','sandbox_mode':'"workspace-write"',
    'sandbox_workspace_write.network_access':'false','sandbox_workspace_write.writable_roots':'[]',
    'sandbox_workspace_write.exclude_tmpdir_env_var':'false','sandbox_workspace_write.exclude_slash_tmp':'true',
    'shell_environment_policy.inherit':'"core"','shell_environment_policy.ignore_default_excludes':'false'
  };
  let section=''; const actual={};
  for(const raw of text.split(/\r?\n/)) {
    const line=raw.replace(/#.*$/,'').trim(); if(!line)continue;
    if(/^\[[a-z_]+\]$/.test(line)){section=line.slice(1,-1);continue;}
    const match=/^([a-z_]+)\s*=\s*(.+)$/.exec(line); if(!match)throw new Error('TOML fora do subconjunto permitido');
    const key=(section?section+'.':'')+match[1]; if(key in actual)throw new Error('Chave duplicada'); actual[key]=match[2];
  }
  if(JSON.stringify(Object.entries(actual).sort())!==JSON.stringify(Object.entries(wanted).sort()))throw new Error('Config diverge das chaves/valores revisados');
  return true;
}
if(process.argv[1]?.endsWith('check-codex-config.mjs')){validateConfig(fs.readFileSync('.codex/config.toml','utf8'));console.log('Config: subconjunto TOML e valores revisados válidos; enforcement não testado.');}
