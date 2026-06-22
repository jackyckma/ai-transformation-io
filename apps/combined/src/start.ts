import { spawn, type ChildProcess } from 'node:child_process';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import httpProxy from 'http-proxy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../../..');

const IO_HOST = process.env.SITE_IO_HOST ?? 'ai-transformation.io';
const ORG_HOST = process.env.SITE_ORG_HOST ?? 'ai-transformation.org';
const API_BASE = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';
const PUBLIC_PORT = Number(process.env.PORT ?? 8080);

const IO_INTERNAL = Number(process.env.WEB_IO_PORT ?? 3002);
const ORG_INTERNAL = Number(process.env.WEB_ORG_PORT ?? 3003);

const proxy = httpProxy.createProxyServer({
  ws: true,
  xfwd: true,
});

const children: ChildProcess[] = [];

function spawnApp(name: string, filter: string, env: Record<string, string>): ChildProcess {
  const child = spawn('pnpm', ['--filter', filter, 'start'], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  child.on('exit', (code) => {
    console.error(`[combined] ${name} exited with code ${code}`);
    process.exit(code ?? 1);
  });
  children.push(child);
  return child;
}

function normalizeHost(hostHeader: string | undefined): string {
  return (hostHeader ?? '').split(':')[0].toLowerCase();
}

function routeTarget(host: string, url: string | undefined): string {
  if (url?.startsWith('/api')) {
    return API_BASE;
  }
  if (host === IO_HOST || host === `www.${IO_HOST}`) {
    return `http://127.0.0.1:${IO_INTERNAL}`;
  }
  if (host === ORG_HOST || host === `www.${ORG_HOST}`) {
    return `http://127.0.0.1:${ORG_INTERNAL}`;
  }
  // Local dev default → .io
  return `http://127.0.0.1:${IO_INTERNAL}`;
}

function proxyRequest(req: IncomingMessage, res: ServerResponse): void {
  const host = normalizeHost(req.headers.host);
  const target = routeTarget(host, req.url);
  const isApi = req.url?.startsWith('/api');

  // Backend resolves .io vs .org from Host; preserve it when proxying /api.
  if (isApi && host) {
    req.headers['x-forwarded-host'] = host;
  }

  proxy.web(req, res, { target, changeOrigin: !isApi }, (err) => {
    console.error('[combined] proxy error', err);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway');
    }
  });
}

function shutdown(): void {
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('[combined] Starting backend, web-io, web-org…');

spawnApp('backend', '@ai-transformation/backend', { PORT: String(new URL(API_BASE).port || 3001) });
spawnApp('web-io', '@ai-transformation/web-io', { PORT: String(IO_INTERNAL) });
spawnApp('web-org', '@ai-transformation/web-org', { PORT: String(ORG_INTERNAL) });

// Brief delay for child processes to bind
setTimeout(() => {
  const server = createServer(proxyRequest);

  server.on('upgrade', (req, socket, head) => {
    const host = normalizeHost(req.headers.host);
    const target = routeTarget(host, req.url);
    proxy.ws(req, socket, head, { target, changeOrigin: true });
  });

  server.listen(PUBLIC_PORT, '0.0.0.0', () => {
    console.log(`[combined] Proxy listening on :${PUBLIC_PORT}`);
    console.log(`[combined] .io → :${IO_INTERNAL} | .org → :${ORG_INTERNAL} | /api → ${API_BASE}`);
  });
}, 3000);
