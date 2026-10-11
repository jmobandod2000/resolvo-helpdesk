#!/usr/bin/env node
// Resolvo CLI: instala, arranca y mantiene Resolvo con Docker. Sin dependencias (Node 18+).
// Uso: ./resolvo <comando>   (Windows: resolvo <comando>)

import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, chmodSync } from 'node:fs';
import { hostname } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = join(ROOT, '.env');
const BACKUP_DIR = join(ROOT, 'backups');
const BACK_DIR = join(ROOT, 'tickets-back');
const FRONT_DIR = join(ROOT, 'tickets-front');
const HEALTH_TIMEOUT_MS = 180_000;
const SAFE_VALUE = /^[A-Za-z0-9_./:@+-]*$/;

const LANG = (process.env.RESOLVO_LANG || process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale || 'es')
  .toLowerCase()
  .startsWith('en')
  ? 'en'
  : 'es';

const MSG = {
  es: {
    title: 'Resolvo · mesa de ayuda de TI',
    help: `Comandos:
  install         Asistente: configura .env y levanta Resolvo (solo la primera vez)
  config          Cambia la configuración (puerto, administrador, correo) y reinicia
  start           Inicia Resolvo
  stop            Detiene Resolvo (los datos se conservan)
  restart         Reinicia Resolvo
  status          Estado de los servicios
  logs            Registros de la aplicación en vivo (Ctrl+C para salir)
  update          Respaldo + descarga de la última versión + reinicio
  backup          Respaldo de la base de datos en ./backups
  restore <file>  Restaura un respaldo (reemplaza los datos actuales)
  dev             Modo desarrollo: base en Docker + API y web locales con recarga
  help            Esta ayuda`,
    noDocker: 'No se encontró Docker. Instálalo desde https://docs.docker.com/get-docker/ y vuelve a intentarlo.',
    dockerDown: 'Docker está instalado pero no responde. Abre Docker Desktop (o inicia el servicio) y vuelve a intentarlo.',
    noEnv: 'Aún no hay configuración. Ejecuta primero: resolvo install',
    envExists: 'Ya existe un .env. ¿Quieres reconfigurarlo? Los valores actuales se ofrecen por defecto',
    keepEnv: 'Se conserva la configuración actual.',
    sectionServer: 'Servidor',
    sectionAdmin: 'Administrador inicial (solo se crea si la base está vacía)',
    sectionMail: 'Correo para avisar al solicitante del portal (opcional)',
    port: 'Puerto web',
    bind: '¿Acceso desde toda la red? (no = solo este equipo, útil detrás de un proxy HTTPS)',
    appUrl: 'Dirección con la que los usuarios abrirán Resolvo',
    tz: 'Zona horaria',
    adminName: 'Nombre',
    adminEmail: 'Correo (será tu usuario)',
    adminPassword: 'Contraseña (Enter = generar una segura)',
    passwordShort: 'Mínimo 8 caracteres.',
    noQuotes: "No uses comillas simples (').",
    invalidEmail: 'Correo no válido.',
    invalidPort: 'Puerto no válido (1-65535).',
    useMail: '¿Configurar correo ahora? (se puede hacer después con: resolvo config)',
    smtpHost: 'Servidor SMTP (ej. smtp.office365.com)',
    smtpPort: 'Puerto SMTP',
    smtpSecure: '¿Conexión SSL directa? (sí para 465, no para 587)',
    smtpUser: 'Usuario SMTP',
    smtpPass: 'Contraseña SMTP',
    mailFrom: 'Remitente',
    image: '¿Descargar la imagen lista? (no = compilarla en este equipo, tarda varios minutos)',
    envSaved: 'Configuración guardada en .env',
    pulling: 'Descargando Resolvo...',
    pullFailed: 'No se pudo descargar la imagen; se compila en este equipo (puede tardar unos minutos)...',
    building: 'Compilando Resolvo...',
    starting: 'Iniciando servicios...',
    waiting: 'Esperando a que Resolvo responda',
    ready: 'Resolvo está listo',
    notReady: 'Resolvo no respondió a tiempo. Revisa los registros con: resolvo logs',
    openAt: 'Abre',
    loginWith: 'Entra con',
    generatedPassword: 'Contraseña generada (guárdala, no se vuelve a mostrar)',
    nextSteps: 'La primera vez, el asistente de la app te pedirá los datos de la empresa, las sedes y las categorías.',
    stopped: 'Resolvo detenido. Los datos se conservan.',
    backupDone: 'Respaldo creado',
    restoreConfirm: 'Esto REEMPLAZA todos los datos actuales por los del respaldo. Escribe RESTAURAR para continuar',
    restoreCancelled: 'Restauración cancelada.',
    restoreDone: 'Respaldo restaurado.',
    restoreMissing: 'Indica un archivo existente: resolvo restore backups/archivo.dump',
    updateGit: 'Actualizando el código (git pull)...',
    devNeedsPnpm: 'El modo desarrollo necesita pnpm: npm install -g pnpm',
    devEnvCreated: 'Se creó tickets-back/.env con valores de desarrollo.',
    devInstall: 'Instalando dependencias en',
    devMigrate: 'Aplicando migraciones...',
    devRunning: 'API en http://localhost:3010/api · Web en http://localhost:9010 · Ctrl+C para detener',
    unknown: 'Comando desconocido',
    yes: 's',
    yesNo: '(s/n)',
    envOnly: 'Configuración lista. Continúa el arranque con Docker.',
  },
  en: {
    title: 'Resolvo · IT help desk',
    help: `Commands:
  install         Wizard: creates .env and starts Resolvo (first time only)
  config          Change settings (port, admin, email) and restart
  start           Start Resolvo
  stop            Stop Resolvo (data is kept)
  restart         Restart Resolvo
  status          Service status
  logs            Live application logs (Ctrl+C to exit)
  update          Backup + pull the latest version + restart
  backup          Database backup into ./backups
  restore <file>  Restore a backup (replaces current data)
  dev             Development mode: database in Docker + local API and web with reload
  help            This help`,
    noDocker: 'Docker was not found. Install it from https://docs.docker.com/get-docker/ and try again.',
    dockerDown: 'Docker is installed but not responding. Open Docker Desktop (or start the service) and try again.',
    noEnv: 'No configuration yet. Run first: resolvo install',
    envExists: 'A .env already exists. Reconfigure it? Current values are offered as defaults',
    keepEnv: 'Keeping the current configuration.',
    sectionServer: 'Server',
    sectionAdmin: 'Initial administrator (created only when the database is empty)',
    sectionMail: 'Email to notify portal requesters (optional)',
    port: 'Web port',
    bind: 'Allow access from the whole network? (no = this machine only, useful behind an HTTPS proxy)',
    appUrl: 'Address users will open Resolvo with',
    tz: 'Time zone',
    adminName: 'Name',
    adminEmail: 'Email (your username)',
    adminPassword: 'Password (Enter = generate a strong one)',
    passwordShort: 'At least 8 characters.',
    noQuotes: "Do not use single quotes (').",
    invalidEmail: 'Invalid email.',
    invalidPort: 'Invalid port (1-65535).',
    useMail: 'Configure email now? (can be done later with: resolvo config)',
    smtpHost: 'SMTP server (e.g. smtp.office365.com)',
    smtpPort: 'SMTP port',
    smtpSecure: 'Direct SSL connection? (yes for 465, no for 587)',
    smtpUser: 'SMTP user',
    smtpPass: 'SMTP password',
    mailFrom: 'Sender',
    image: 'Download the ready-made image? (no = build it on this machine, takes several minutes)',
    envSaved: 'Configuration saved to .env',
    pulling: 'Downloading Resolvo...',
    pullFailed: 'Could not download the image; building it on this machine (may take a few minutes)...',
    building: 'Building Resolvo...',
    starting: 'Starting services...',
    waiting: 'Waiting for Resolvo to respond',
    ready: 'Resolvo is ready',
    notReady: 'Resolvo did not respond in time. Check the logs with: resolvo logs',
    openAt: 'Open',
    loginWith: 'Sign in with',
    generatedPassword: 'Generated password (save it, it will not be shown again)',
    nextSteps: 'On first sign-in, the app wizard asks for the company, sites and categories.',
    stopped: 'Resolvo stopped. Data is kept.',
    backupDone: 'Backup created',
    restoreConfirm: 'This REPLACES all current data with the backup. Type RESTORE to continue',
    restoreCancelled: 'Restore cancelled.',
    restoreDone: 'Backup restored.',
    restoreMissing: 'Pass an existing file: resolvo restore backups/file.dump',
    updateGit: 'Updating the code (git pull)...',
    devNeedsPnpm: 'Development mode needs pnpm: npm install -g pnpm',
    devEnvCreated: 'Created tickets-back/.env with development values.',
    devInstall: 'Installing dependencies in',
    devMigrate: 'Applying migrations...',
    devRunning: 'API at http://localhost:3010/api · Web at http://localhost:9010 · Ctrl+C to stop',
    unknown: 'Unknown command',
    yes: 'y',
    yesNo: '(y/n)',
    envOnly: 'Configuration ready. Continue starting with Docker.',
  },
}[LANG];

const RESTORE_WORD = LANG === 'en' ? 'RESTORE' : 'RESTAURAR';

// ---------- salida ----------
const color = (code) => (text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = color('1');
const blue = color('34');
const green = color('32');
const yellow = color('33');
const red = color('31');
const dim = color('2');

const info = (text) => console.log(`${blue('›')} ${text}`);
const ok = (text) => console.log(`${green('✔')} ${text}`);
const warn = (text) => console.log(`${yellow('!')} ${text}`);
const fail = (text) => {
  console.error(`${red('✖')} ${text}`);
  process.exit(1);
};

// ---------- utilidades ----------
const IS_WINDOWS = process.platform === 'win32';

// pnpm en Windows es un .cmd: se invoca a través de cmd.exe (sin shell: true, que concatena argumentos)
const resolveCommand = (cmd, args) =>
  IS_WINDOWS && cmd === 'pnpm' ? ['cmd.exe', ['/d', '/s', '/c', 'pnpm', ...args]] : [cmd, args];

const run = (cmd, args, options = {}) => {
  const [file, fileArgs] = resolveCommand(cmd, args);
  return spawnSync(file, fileArgs, { cwd: ROOT, stdio: 'inherit', ...options });
};

const compose = (args, options) => run('docker', ['compose', ...args], options);

const ensureDocker = () => {
  const version = spawnSync('docker', ['--version']);
  if (version.status !== 0) fail(MSG.noDocker);
  const daemon = spawnSync('docker', ['info'], { stdio: 'ignore' });
  if (daemon.status !== 0) fail(MSG.dockerDown);
};

const secret = (bytes = 24) => randomBytes(bytes).toString('hex');

const readEnv = (file = ENV_FILE) => {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
  }
  return env;
};

const formatValue = (value) => (SAFE_VALUE.test(value) ? value : `'${value}'`);

const writeEnv = (values) => {
  const lines = [
    '# Resolvo — generado por `resolvo install`. Cambia valores con: resolvo config',
    '',
    ...Object.entries(values).map(([key, value]) => `${key}=${formatValue(String(value ?? ''))}`),
    '',
  ];
  writeFileSync(ENV_FILE, lines.join('\n'), 'utf8');
  try {
    chmodSync(ENV_FILE, 0o600);
  } catch {
    // Windows no maneja permisos POSIX
  }
};

const appPort = () => readEnv().RESOLVO_PORT || '8080';

const waitForHealth = async (port = appPort()) => {
  process.stdout.write(`${blue('›')} ${MSG.waiting}`);
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        process.stdout.write('\n');
        return true;
      }
    } catch {
      // aún arrancando
    }
    process.stdout.write('.');
    await new Promise((done) => setTimeout(done, 2000));
  }
  process.stdout.write('\n');
  return false;
};

// ---------- preguntas ----------
const createPrompt = () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const ask = async (label, fallback = '', validate) => {
    for (;;) {
      const suffix = fallback ? dim(` [${fallback}]`) : '';
      const answer = (await rl.question(`  ${label}${suffix}: `)).trim() || fallback;
      const error = validate?.(answer);
      if (!error) return answer;
      warn(error);
    }
  };

  const confirm = async (label, fallback = true) => {
    const hint = fallback ? MSG.yesNo.replace(MSG.yes, MSG.yes.toUpperCase()) : MSG.yesNo.replace('n)', 'N)');
    const answer = (await rl.question(`  ${label} ${dim(hint)}: `)).trim().toLowerCase();
    if (!answer) return fallback;
    return answer.startsWith(MSG.yes) || answer.startsWith('y');
  };

  // Lectura sin eco para contraseñas
  const secretInput = (label) =>
    new Promise((done) => {
      const stdin = process.stdin;
      if (!stdin.isTTY) {
        rl.question(`  ${label}: `).then((value) => done(value.trim()));
        return;
      }
      rl.pause();
      process.stdout.write(`  ${label}: `);
      stdin.setRawMode(true);
      stdin.resume();
      let value = '';
      const onData = (buffer) => {
        for (const char of buffer.toString('utf8')) {
          if (char === '\r' || char === '\n') {
            stdin.setRawMode(false);
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            rl.resume();
            done(value);
            return;
          }
          if (char === '\u0003') process.exit(130);
          if (char === '\u007f' || char === '\b') {
            if (value) {
              value = value.slice(0, -1);
              process.stdout.write('\b \b');
            }
            continue;
          }
          value += char;
          process.stdout.write('*');
        }
      };
      stdin.on('data', onData);
    });

  return { ask, confirm, secretInput, close: () => rl.close() };
};

const isEmail = (value) => (/^[^\s@']+@[^\s@']+\.[^\s@']+$/.test(value) ? null : MSG.invalidEmail);
const isPort = (value) => (/^\d+$/.test(value) && +value > 0 && +value < 65536 ? null : MSG.invalidPort);
const noQuote = (value) => (value.includes("'") ? MSG.noQuotes : null);

const section = (title) => console.log(`\n${bold(title)}`);

const wizard = async () => {
  const current = readEnv();
  const prompt = createPrompt();
  try {
    if (Object.keys(current).length && !(await prompt.confirm(MSG.envExists, false))) {
      ok(MSG.keepEnv);
      return { values: current, generatedPassword: null };
    }

    section(MSG.sectionServer);
    const port = await prompt.ask(MSG.port, current.RESOLVO_PORT || '8080', isPort);
    const network = await prompt.confirm(MSG.bind, (current.RESOLVO_BIND || '0.0.0.0') === '0.0.0.0');
    const defaultUrl = current.APP_URL
      ? current.APP_URL.replace(new RegExp(`:${current.RESOLVO_PORT || 8080}(?=/|$)`), `:${port}`)
      : `http://${network ? hostname().toLowerCase() : 'localhost'}:${port}`;
    const appUrl = await prompt.ask(MSG.appUrl, defaultUrl, noQuote);
    const tz = await prompt.ask(MSG.tz, current.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', noQuote);

    section(MSG.sectionAdmin);
    const adminName = await prompt.ask(MSG.adminName, current.LOGIN_NAME || 'Administrador', noQuote);
    const adminEmail = await prompt.ask(MSG.adminEmail, current.LOGIN_EMAIL || '', isEmail);
    let adminPassword = '';
    let generatedPassword = null;
    for (;;) {
      adminPassword = await prompt.secretInput(MSG.adminPassword);
      if (!adminPassword) {
        adminPassword = current.LOGIN_PASSWORD || `Rs-${secret(6)}`;
        if (!current.LOGIN_PASSWORD) generatedPassword = adminPassword;
        break;
      }
      const error = adminPassword.length < 8 ? MSG.passwordShort : noQuote(adminPassword);
      if (!error) break;
      warn(error);
    }

    section(MSG.sectionMail);
    const mail = {
      SMTP_HOST: current.SMTP_HOST || '',
      SMTP_PORT: current.SMTP_PORT || '587',
      SMTP_SECURE: current.SMTP_SECURE || 'false',
      SMTP_USER: current.SMTP_USER || '',
      SMTP_PASS: current.SMTP_PASS || '',
      MAIL_FROM: current.MAIL_FROM || '',
    };
    if (await prompt.confirm(MSG.useMail, Boolean(current.SMTP_HOST))) {
      mail.SMTP_HOST = await prompt.ask(MSG.smtpHost, mail.SMTP_HOST, noQuote);
      mail.SMTP_PORT = await prompt.ask(MSG.smtpPort, mail.SMTP_PORT, isPort);
      mail.SMTP_SECURE = String(await prompt.confirm(MSG.smtpSecure, mail.SMTP_PORT === '465'));
      mail.SMTP_USER = await prompt.ask(MSG.smtpUser, mail.SMTP_USER, noQuote);
      const pass = await prompt.secretInput(MSG.smtpPass);
      if (pass) mail.SMTP_PASS = pass;
      mail.MAIL_FROM = await prompt.ask(MSG.mailFrom, mail.MAIL_FROM || `Resolvo <${mail.SMTP_USER || adminEmail}>`, noQuote);
    }

    console.log('');
    const prebuilt = await prompt.confirm(MSG.image, (current.RESOLVO_BUILD || 'false') !== 'true');

    const values = {
      ...current,
      RESOLVO_PORT: port,
      RESOLVO_BIND: network ? '0.0.0.0' : '127.0.0.1',
      RESOLVO_VERSION: current.RESOLVO_VERSION || 'latest',
      RESOLVO_BUILD: String(!prebuilt),
      APP_URL: appUrl,
      TZ: tz,
      DB_NAME: current.DB_NAME || 'resolvo',
      DB_USER: current.DB_USER || 'resolvo',
      DB_PASSWORD: current.DB_PASSWORD || secret(18),
      JWT_SECRET: current.JWT_SECRET || secret(32),
      JWT_EXPIRES_IN: current.JWT_EXPIRES_IN || '12h',
      LOGIN_NAME: adminName,
      LOGIN_EMAIL: adminEmail.toLowerCase(),
      LOGIN_PASSWORD: adminPassword,
      ...mail,
    };
    writeEnv(values);
    ok(MSG.envSaved);
    return { values, generatedPassword };
  } finally {
    prompt.close();
  }
};

// ---------- comandos ----------
const prepareImage = (env) => {
  if (env.RESOLVO_BUILD === 'true') {
    info(MSG.building);
    if (compose(['build', 'app']).status !== 0) process.exit(1);
    return;
  }
  info(MSG.pulling);
  if (compose(['pull', 'app']).status === 0) return;
  warn(MSG.pullFailed);
  if (compose(['build', 'app']).status !== 0) process.exit(1);
};

const up = async (env) => {
  info(MSG.starting);
  if (compose(['up', '-d', '--no-build', 'db', 'app']).status !== 0) process.exit(1);
  const healthy = await waitForHealth(env.RESOLVO_PORT);
  if (!healthy) fail(MSG.notReady);
  ok(MSG.ready);
};

const summary = (env, generatedPassword) => {
  const url = env.APP_URL || `http://localhost:${env.RESOLVO_PORT}`;
  console.log(`\n  ${MSG.openAt}  ${bold(url)}`);
  console.log(`  ${MSG.loginWith} ${bold(env.LOGIN_EMAIL)}`);
  if (generatedPassword) console.log(`  ${MSG.generatedPassword}: ${bold(generatedPassword)}`);
  console.log(`\n  ${dim(MSG.nextSteps)}\n`);
};

const requireEnv = () => {
  const env = readEnv();
  if (!env.DB_PASSWORD) fail(MSG.noEnv);
  return env;
};

const imageMissing = () =>
  spawnSync('docker', ['compose', 'images', '-q', 'app'], { cwd: ROOT, encoding: 'utf8' })
    .stdout?.trim() === '';

const commands = {
  async install() {
    ensureDocker();
    const { values, generatedPassword } = await wizard();
    if (process.argv.includes('--env-only')) {
      ok(MSG.envOnly);
      if (generatedPassword) console.log(`  ${MSG.generatedPassword}: ${bold(generatedPassword)}`);
      return;
    }
    prepareImage(values);
    await up(values);
    summary(values, generatedPassword);
  },

  async config() {
    ensureDocker();
    const { values, generatedPassword } = await wizard();
    if (process.argv.includes('--env-only')) return;
    await up(values);
    summary(values, generatedPassword);
  },

  async start() {
    ensureDocker();
    const env = requireEnv();
    if (imageMissing()) prepareImage(env);
    await up(env);
    summary(env, null);
  },

  stop() {
    ensureDocker();
    compose(['stop']);
    ok(MSG.stopped);
  },

  async restart() {
    ensureDocker();
    const env = requireEnv();
    compose(['restart', 'app']);
    if (await waitForHealth(env.RESOLVO_PORT)) ok(MSG.ready);
    else fail(MSG.notReady);
  },

  async status() {
    ensureDocker();
    const env = requireEnv();
    compose(['ps']);
    try {
      const response = await fetch(`http://127.0.0.1:${env.RESOLVO_PORT || 8080}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      const body = await response.json();
      ok(`${MSG.ready} · ${env.APP_URL || ''} ${body.version ? `· v${body.version}` : ''}`);
    } catch {
      warn(MSG.notReady);
    }
  },

  logs() {
    ensureDocker();
    compose(['logs', '-f', '--tail', '200', 'app']);
  },

  backup() {
    ensureDocker();
    const env = requireEnv();
    mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 13);
    const file = join(BACKUP_DIR, `resolvo_${stamp}.dump`);
    const dump = spawnSync(
      'docker',
      ['compose', 'exec', '-T', 'db', 'pg_dump', '-U', env.DB_USER || 'resolvo', '-d', env.DB_NAME || 'resolvo', '-Fc'],
      { cwd: ROOT, maxBuffer: 1024 * 1024 * 1024 },
    );
    if (dump.status !== 0) fail(dump.stderr?.toString() || 'pg_dump');
    writeFileSync(file, dump.stdout);
    ok(`${MSG.backupDone}: ${file}`);
    return file;
  },

  async restore() {
    ensureDocker();
    const env = requireEnv();
    const file = process.argv[3] && resolve(process.argv[3]);
    if (!file || !existsSync(file)) fail(MSG.restoreMissing);
    const prompt = createPrompt();
    const answer = await prompt.ask(MSG.restoreConfirm);
    prompt.close();
    if (answer !== RESTORE_WORD) {
      warn(MSG.restoreCancelled);
      return;
    }
    compose(['stop', 'app']);
    const restore = spawnSync(
      'docker',
      [
        'compose', 'exec', '-T', 'db', 'pg_restore', '--clean', '--if-exists', '--no-owner',
        '-U', env.DB_USER || 'resolvo', '-d', env.DB_NAME || 'resolvo',
      ],
      { cwd: ROOT, input: readFileSync(file), stdio: ['pipe', 'inherit', 'inherit'] },
    );
    if (restore.status !== 0) fail('pg_restore');
    await up(env);
    ok(MSG.restoreDone);
  },

  async update() {
    ensureDocker();
    const env = requireEnv();
    commands.backup();
    if (existsSync(join(ROOT, '.git'))) {
      info(MSG.updateGit);
      run('git', ['pull', '--ff-only']);
    }
    prepareImage(env);
    await up(env);
  },

  async dev() {
    ensureDocker();
    if (run('pnpm', ['--version'], { stdio: 'ignore' }).status !== 0)
      fail(MSG.devNeedsPnpm);

    const backEnv = join(BACK_DIR, '.env');
    if (!existsSync(backEnv)) {
      copyFileSync(join(BACK_DIR, '.env.example'), backEnv);
      const password = secret(12);
      writeFileSync(
        backEnv,
        readFileSync(backEnv, 'utf8')
          .replaceAll('CAMBIAR_PASSWORD_DB', password)
          .replace('CAMBIAR_POR_SECRETO_LARGO', secret(32)),
      );
      ok(MSG.devEnvCreated);
    }
    const frontEnv = join(FRONT_DIR, '.env');
    if (!existsSync(frontEnv)) copyFileSync(join(FRONT_DIR, '.env.example'), frontEnv);

    for (const dir of [BACK_DIR, FRONT_DIR]) {
      if (!existsSync(join(dir, 'node_modules'))) {
        info(`${MSG.devInstall} ${dir}`);
        if (run('pnpm', ['install'], { cwd: dir }).status !== 0) process.exit(1);
      }
    }

    if (run('docker', ['compose', 'up', '-d', 'db'], { cwd: BACK_DIR }).status !== 0) process.exit(1);
    info(MSG.devMigrate);
    if (run('pnpm', ['prisma', 'migrate', 'deploy'], { cwd: BACK_DIR }).status !== 0) process.exit(1);

    ok(MSG.devRunning);
    const children = [
      ['api', BACK_DIR, ['start:dev'], blue],
      ['web', FRONT_DIR, ['dev'], green],
    ].map(([name, cwd, args, paint]) => {
      const [file, fileArgs] = resolveCommand('pnpm', args);
      const child = spawn(file, fileArgs, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
      const prefix = paint(`[${name}]`);
      const pipe = (stream, out) =>
        stream.on('data', (chunk) =>
          chunk
            .toString()
            .split(/\r?\n/)
            .filter(Boolean)
            .forEach((line) => out.write(`${prefix} ${line}\n`)),
        );
      pipe(child.stdout, process.stdout);
      pipe(child.stderr, process.stderr);
      return child;
    });
    const stopAll = () => {
      children.forEach((child) => child.kill());
      process.exit(0);
    };
    process.on('SIGINT', stopAll);
    process.on('SIGTERM', stopAll);
  },

  help() {
    console.log(`\n${bold(MSG.title)}\n\n${MSG.help}\n`);
  },
};

const name = process.argv[2] || 'help';
const command = commands[name] || commands[name.replace(/^--?/, '')];
if (!command) {
  warn(`${MSG.unknown}: ${name}`);
  commands.help();
  process.exit(1);
}
await command();
