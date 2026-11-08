import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { ROLES, orderedStories, queue, readiness } from './dual-agent-policy.mjs';
const json = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
export async function initialize(root) {
  root = path.resolve(root);
  await fs.mkdir(root, { recursive: true });
  const marker = path.join(root, 'manifest.json');
  try { await fs.access(marker); throw new Error('Runtime exists; refusing overwrite'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const shared = await fs.readFile(path.join(sourceRoot, '.codex/config.toml'), 'utf8');
  const roles = {};
  for (const role of ROLES) {
    const workspace = path.join(root, role, 'workspace'), codexHome = path.join(root, role, 'codex-home');
    await fs.mkdir(workspace, { recursive: true }); await fs.mkdir(codexHome, { recursive: true });
    await fs.writeFile(path.join(codexHome, 'config.toml'), shared, { flag: 'wx', mode: 0o600 });
    await fs.writeFile(path.join(root, role, 'prompt.md'), 'Read AGENTS.md and .agents/dual-agent.md. Operate as ' + role +
      '. Re-read live GitHub state. Do not begin before all applicable gates are proven. Operational never merges; arbiter analysis is not independent human approval.\n', { flag: 'wx' });
    roles[role] = { workspace, codexHome, cloned: false, authenticated: false };
  }
  const manifest = { schema: 1, mode: 'DUAL_AGENT_MODE', active: false, roles };
  await fs.writeFile(marker, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  await fs.writeFile(path.join(root, 'evidence.json'), JSON.stringify({ expiresAt: 0, identities: {}, gates: {}, proofs: {} }, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}
export function cloneSpec(root, role, token) {
  if (!ROLES.includes(role)) throw new Error('Unknown role');
  if (!token) throw new Error('Dedicated HCG_CLONE_TOKEN missing; do not borrow personal credentials');
  const workspace = path.resolve(root, role, 'workspace'), home = path.resolve(root, 'trusted-preparation');
  return { command: 'git', args: ['-c','credential.helper=','clone','--single-branch','--branch','develop','--no-tags',
    'https://github.com/gabrielmilagresdev/HomeCare-Grid.git', workspace],
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, TMP: process.env.TMP,
      HOME: home, USERPROFILE: home, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never',
      GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
      GIT_CONFIG_VALUE_0: 'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + token).toString('base64') } };
}
export async function prepare(root, token = process.env.HCG_CLONE_TOKEN, runner) {
  root = path.resolve(root); const manifest = await json(path.join(root, 'manifest.json'));
  await fs.mkdir(path.join(root, 'trusted-preparation'), { recursive: true });
  for (const role of ROLES) {
    const expected = path.resolve(root, role, 'workspace');
    if (manifest.roles[role].workspace !== expected || (await fs.realpath(expected)) !== expected) throw new Error('Workspace moved or symlinked');
    if ((await fs.readdir(expected)).length) throw new Error('Workspace not empty; refusing overwrite');
    const spec = cloneSpec(root, role, token);
    const result = runner ? await runner(spec) : await new Promise((resolve, reject) => {
      const child = spawn(spec.command, spec.args, { env: spec.env, shell: false, windowsHide: true, stdio: 'ignore' });
      const timer = setTimeout(() => child.kill(), 120000); child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('close', code => { clearTimeout(timer); resolve({ ok: code === 0 }); });
    });
    if (!result.ok) throw new Error('Clone failed; no credential/output logged; inspect dedicated network/auth externally');
    manifest.roles[role].cloned = true;
    await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return { ...manifest, active: false };
}
export async function main(args = process.argv.slice(2)) {
  const [command, target, snapshot] = args;
  const [mode, plan, map] = await Promise.all(['.agents/mode.json','docs/agile/backlog.json','docs/agile/github-map.json'].map(p => json(path.join(sourceRoot, p))));
  if (command === 'plan') return orderedStories(plan, mode).map(s => ({ issue: map[s.id].number, title: s.title, originalOwner: s.owner, executor: s.role === 'arbiter' ? 'lucas-arbiter' : 'lucas-operational' }));
  if (command === 'init') return initialize(target);
  if (command === 'prepare') return prepare(target);
  if (command === 'queue') return queue(plan, map, mode, await json(target));
  if (command === 'check') {
    const manifest = await json(path.join(target, 'manifest.json')), evidence = await json(path.join(target, 'evidence.json'));
    const result = readiness(mode, evidence, await json(snapshot));
    for (const role of ROLES) {
      const expected = path.resolve(target, role, 'workspace');
      if (manifest.roles[role]?.workspace !== expected || !manifest.roles[role]?.cloned) { result.ready = false; result.blockers.push('Clone pending: ' + role); }
    }
    if (!result.ready) result.verdict = 'NOT READY — BLOCKERS REMAIN';
    return result;
  }
  return { usage: 'node scripts/dual-agent.mjs plan | init <root> | prepare <root> | queue <issues-snapshot.json> | check <root> <issues-snapshot.json>',
    note: 'Conventional GitHub flow; no broker, distributed lock, daemon or containers required. Snapshots are diagnostic, never authorization.' };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await main(); console.log(JSON.stringify(result, null, 2)); if (result.ready === false) process.exitCode = 2; }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
