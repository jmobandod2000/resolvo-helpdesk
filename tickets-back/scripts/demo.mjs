import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [command, ...args] = process.argv.slice(2);

const readEnv = () => {
  const file = join(root, '.env');
  if (!existsSync(file)) throw new Error('No existe tickets-back/.env (copia .env.example).');
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim().replace(/^"|"$/g, '')]),
  );
};

const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};

const env = readEnv();
const url = new URL(env.DATABASE_URL);
const database = url.pathname.replace(/^\//, '');
url.pathname = `/${database.endsWith('_demo') ? database : `${database}_demo`}`;
const port = option('port', '3011');
const demoEnv = {
  ...process.env,
  DATABASE_URL: url.toString(),
  PORT: port,
  HOST: `http://localhost:${port}/api`,
  SEED_EXAMPLE_TICKETS: 'false',
  APP_URL: env.APP_URL || 'http://localhost:9010',
  SMTP_HOST: env.SMTP_HOST || '127.0.0.1',
  SMTP_PORT: env.SMTP_HOST ? env.SMTP_PORT || '587' : '1025',
  MAIL_FROM: env.MAIL_FROM || 'Resolvo Demo <soporte@demo.local>',
};

const run = (cmd, cmdArgs) => {
  const result = spawnSync([cmd, ...cmdArgs].join(' '), {
    cwd: root,
    env: demoEnv,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (command === 'setup') {
  console.log(`Base de demostración: ${url.pathname.slice(1)}`);
  run('npx', ['prisma', 'migrate', 'deploy']);
  run('npx', ['ts-node', 'prisma/demo-seed.ts']);
} else if (command === 'start') {
  if (!existsSync(join(root, 'dist', 'main.js'))) run('pnpm', ['build']);
  console.log(`API de demostración en http://localhost:${port}/api (base ${url.pathname.slice(1)})`);
  const child = spawn('node', ['dist/main.js'], { cwd: root, env: demoEnv, stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 0));
} else {
  console.log('Uso: node scripts/demo.mjs setup | start [--port 3011]');
  process.exit(1);
}
