import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';

const DEFAULT_PORT = 3000;
const HOST = process.env.HOST;
const existingServer = getExistingNextServer();

if (existingServer) {
  console.log(`Web dev server is already running at ${existingServer.appUrl} (PID ${existingServer.pid}).`);
  process.exit(0);
}

const preferredPort = parsePort(process.env.WEB_PORT ?? process.env.PORT) ?? DEFAULT_PORT;
const port = await findAvailablePort(preferredPort);

if (port !== preferredPort) {
  console.log(`Port ${preferredPort} is in use. Starting web dev server on ${port}.`);
}

const nextArgs = ['node_modules/next/dist/bin/next', 'dev', '--port', String(port)];
if (HOST) {
  nextArgs.push('--hostname', HOST);
}

const child = spawn(process.execPath, nextArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    PORT: String(port)
  }
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

function parsePort(value) {
  if (!value) {
    return null;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid port "${value}". Expected a number between 1 and 65535.`);
  }

  return port;
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port <= 65_535; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available port found from ${startPort} to 65535.`);
}

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
        resolve(false);
        return;
      }

      reject(error);
    });
    server.listen(HOST ? { host: HOST, port } : { port }, () => {
      server.close(() => resolve(true));
    });
  });
}

function getExistingNextServer() {
  const lockPath = '.next/dev/lock';
  if (!existsSync(lockPath)) {
    return null;
  }

  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    const pid = Number(lock.pid);
    const appUrl = typeof lock.appUrl === 'string' ? lock.appUrl : null;

    if (!Number.isInteger(pid) || !appUrl || !isProcessRunning(pid)) {
      return null;
    }

    return { appUrl, pid };
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === 'EPERM') {
      return true;
    }

    return false;
  }
}
