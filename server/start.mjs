import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createConciergeServer } from './http.mjs';

const host = process.env.CONCIERGE_HOST || '127.0.0.1';
const port = Number(process.env.CONCIERGE_PORT || 8787);
const publicUrl = process.env.CONCIERGE_PUBLIC_URL || `http://127.0.0.1:${port}`;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('CONCIERGE_PORT inválida');
if (!['127.0.0.1', 'localhost', '::1'].includes(host) && !process.env.CONCIERGE_PUBLIC_URL) throw new Error('Defina CONCIERGE_PUBLIC_URL para acesso via rede local.');
if (!/^https?:\/\/[^\s]+$/u.test(publicUrl)) throw new Error('CONCIERGE_PUBLIC_URL inválida');
if (!process.env.XAI_API_KEY) throw new Error('Defina XAI_API_KEY no ambiente do servidor.');

const clientToken = randomBytes(24).toString('base64url');
const envPath = new URL('../.env.local', import.meta.url);
let existing = '';
try { existing = await readFile(envPath, 'utf8'); } catch (cause) { if (cause.code !== 'ENOENT') throw cause; }
const lines = existing.split(/\r?\n/u).filter(line => !/^EXPO_PUBLIC_CONCIERGE_(API_URL|CLIENT_TOKEN)=/u.test(line));
lines.push(`EXPO_PUBLIC_CONCIERGE_API_URL=${publicUrl}`);
lines.push(`EXPO_PUBLIC_CONCIERGE_CLIENT_TOKEN=${clientToken}`);
await writeFile(envPath, lines.filter(Boolean).join('\n') + '\n', { mode: 0o600 });

const server = createConciergeServer({ clientToken });
server.listen(port, host, () => console.info(`Concierge pronto em ${publicUrl}. Configuração local escrita em .env.local; reinicie o Expo Go.`));
