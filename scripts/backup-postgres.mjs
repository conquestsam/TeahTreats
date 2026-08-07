import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const backupDir = process.env.BACKUP_DIR ?? 'backups';
mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = join(backupDir, `snacks-commerce-${timestamp}.sql.gz`);

await createBackup(databaseUrl, backupPath);
await notifyAll(backupPath);

console.log(`Backup created: ${backupPath}`);

async function createBackup(url, outputPath) {
  const dump = spawn('pg_dump', [url, '--no-owner', '--no-privileges'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const errors = [];
  dump.stderr.on('data', (chunk) => errors.push(chunk));
  await pipeline(
    dump.stdout,
    createGzip(),
    await import('node:fs').then(({ createWriteStream }) => createWriteStream(outputPath)),
  );
  const exitCode = await new Promise((resolve) => dump.on('close', resolve));
  if (exitCode !== 0) {
    throw new Error(
      `pg_dump failed with exit code ${exitCode}: ${Buffer.concat(errors).toString('utf8')}`,
    );
  }
}

async function notifyAll(filePath) {
  const size = statSync(filePath).size;
  const message = `Snacks Commerce database backup created: ${basename(filePath)} (${formatBytes(size)}).`;
  const tasks = [
    notifyTelegram(filePath, message),
    notifyDiscord(filePath, message),
    notifyWebhook(process.env.SLACK_WEBHOOK_URL, { text: message }, 'Slack'),
    notifyWebhook(process.env.TEAMS_WEBHOOK_URL, { text: message }, 'Teams'),
  ];
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn(result.reason instanceof Error ? result.reason.message : String(result.reason));
    }
  }
}

async function notifyTelegram(filePath, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || !existsSync(filePath)) {
    return;
  }
  const form = new FormData();
  form.set('chat_id', chatId);
  form.set('caption', caption);
  form.set(
    'document',
    new Blob([await import('node:fs/promises').then(({ readFile }) => readFile(filePath))]),
    basename(filePath),
  );
  const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    throw new Error(
      `Telegram backup notification failed: ${response.status} ${await response.text()}`,
    );
  }
}

async function notifyDiscord(filePath, content) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || !existsSync(filePath)) {
    return;
  }
  const form = new FormData();
  form.set('payload_json', JSON.stringify({ content }));
  form.set(
    'files[0]',
    new Blob([await import('node:fs/promises').then(({ readFile }) => readFile(filePath))]),
    basename(filePath),
  );
  const response = await fetch(webhookUrl, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error(
      `Discord backup notification failed: ${response.status} ${await response.text()}`,
    );
  }
}

async function notifyWebhook(webhookUrl, payload, label) {
  if (!webhookUrl) {
    return;
  }
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `${label} backup notification failed: ${response.status} ${await response.text()}`,
    );
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
