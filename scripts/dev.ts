const production = process.argv.includes('--production');
const children = ['api', 'worker'].map((app) =>
  Bun.spawn(
    [
      'node',
      '--env-file-if-exists=.env',
      ...(production ? [] : ['--conditions=development', '--watch']),
      `apps/${app}/${production ? 'dist/main.js' : 'src/main.ts'}`,
    ],
    { stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' },
  ),
);
let stopping = false;
async function stop(code: number) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill('SIGTERM'));
  const deadline = setTimeout(() => children.forEach((child) => child.kill('SIGKILL')), 20000);
  await Promise.all(children.map((child) => child.exited));
  clearTimeout(deadline);
  process.exitCode = code;
}
process.on('SIGINT', () => void stop(0));
process.on('SIGTERM', () => void stop(0));
await Promise.race(children.map((child) => child.exited)).then((code) =>
  stop(code === 0 ? 1 : code),
);
