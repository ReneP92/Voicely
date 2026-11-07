import { constants } from 'node:fs';
import { copyFile } from 'node:fs/promises';

const expectedBun = (await Bun.file('.bun-version').text()).trim();
const expectedNode = (await Bun.file('.node-version').text()).trim();
if (Bun.version !== expectedBun) throw new Error(`Use Bun ${expectedBun}; found ${Bun.version}.`);
const node = Bun.spawnSync(['node', '--version']);
if (node.exitCode !== 0 || node.stdout.toString().trim() !== `v${expectedNode}`)
  throw new Error(`Use Node ${expectedNode} from .node-version.`);
try {
  await copyFile('.env.example', '.env', constants.COPYFILE_EXCL);
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error;
}
for (const command of [
  ['bun', 'install', '--frozen-lockfile'],
  ['bun', 'run', 'db:up'],
  ['bun', 'run', 'db:migrate'],
  ['bun', 'run', 'demo:reset'],
]) {
  const child = Bun.spawn(command, { stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' });
  const code = await child.exited;
  if (code !== 0) process.exit(code);
}
console.log('Ready. Run bun run dev; API: http://127.0.0.1:4100/health/ready');
