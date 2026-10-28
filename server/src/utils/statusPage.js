import os from 'os';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const DB_STATES = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
};

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const classifyLoad = () => {
  const cpus = os.cpus()?.length || 1;
  const [load1] = os.loadavg?.() || [0];
  const ratio = load1 / cpus;
  if (!Number.isFinite(ratio) || ratio <= 0.6) return { label: 'Low', badge: 'Healthy', tone: 'ok' };
  if (ratio <= 1.2) return { label: 'Moderate', badge: 'Stable', tone: 'warn' };
  return { label: 'High', badge: 'Strained', tone: 'bad' };
};

export const collectStatus = (startedAt = Date.now()) => {
  const dbState = mongoose.connection?.readyState ?? 0;
  const dbLabel = DB_STATES[dbState] || 'Unknown';
  const dbOk = dbState === 1;

  const load = classifyLoad();
  const responseMs = Math.max(0, Date.now() - startedAt);

  const allOk = dbOk && load.tone !== 'bad';

  return {
    ok: allOk,
    headline: allOk ? 'ALL SYSTEMS OPERATIONAL' : dbOk ? 'DEGRADED PERFORMANCE' : 'DATABASE UNAVAILABLE',
    summary: allOk
      ? 'Backend infrastructure is healthy and performing optimally. All services are running smoothly.'
      : dbOk
      ? 'Backend is reachable but experiencing elevated load. Requests may be slower than usual.'
      : 'Backend cannot reach MongoDB. API routes that depend on the database will fail.',
    uptime: formatUptime(process.uptime()),
    responseMs,
    load,
    db: {
      label: dbLabel,
      ok: dbOk,
    },
    environment: env.nodeEnv,
    runtime: `Node.js ${process.version.replace(/^v/, '')}`,
    framework: 'Express',
    region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'Global',
    checkedAt: new Date(),
  };
};

const escape = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const renderStatusHtml = (status) => {
  const toneColor = {
    ok: { ring: '34,197,94', text: '#22c55e' },
    warn: { ring: '234,179,8', text: '#eab308' },
    bad: { ring: '239,68,68', text: '#ef4444' },
  };
  const overall = status.ok ? 'ok' : status.db.ok ? 'warn' : 'bad';
  const c = toneColor[overall];
  const checkIcon = status.ok
    ? '<polyline points="4 12 10 18 20 6" />'
    : '<line x1="12" y1="7" x2="12" y2="13" /><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />';

  const dbBadge = status.db.ok
    ? '<span class="badge ok">Connected</span>'
    : '<span class="badge bad">Offline</span>';
  const loadBadge = `<span class="badge ${status.load.tone}">${escape(status.load.badge)}</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Spendly Server Status</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
    background: #0a0f1c;
    color: #e6edf3;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }
  .card {
    width: 100%;
    max-width: 720px;
    background: #111827;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 20px;
    padding: 56px 40px 28px;
    position: relative;
    text-align: center;
  }
  .check {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: rgba(${c.ring},0.12);
    box-shadow: 0 0 48px rgba(${c.ring},0.35), inset 0 0 0 2px rgba(${c.ring},0.4);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    color: ${c.text};
  }
  .check svg { width: 36px; height: 36px; stroke: currentColor; fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(${c.ring},0.12);
    border: 1px solid rgba(${c.ring},0.25);
    color: ${c.text};
    padding: 6px 14px; border-radius: 999px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    margin-bottom: 16px;
  }
  .pill::before { content: ""; width: 6px; height: 6px; background: ${c.text}; border-radius: 50%; }
  h1 { font-size: 30px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.01em; }
  .lead { color: #9ca3af; font-size: 14px; line-height: 1.55; margin: 0 auto 30px; max-width: 520px; }
  .metrics {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    margin-bottom: 24px;
  }
  .metric {
    background: #0b1220;
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 14px;
    padding: 18px 14px;
    text-align: left;
  }
  .metric .label {
    color: #6b7280; font-size: 10px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .metric .value { color: #fff; font-size: 22px; font-weight: 700; margin-bottom: 10px; line-height: 1.1; }
  .badge {
    display: inline-block; font-size: 10px; font-weight: 600;
    padding: 3px 9px; border-radius: 999px;
    background: rgba(34,197,94,0.12); color: #22c55e;
  }
  .badge.ok { background: rgba(34,197,94,0.12); color: #22c55e; }
  .badge.warn { background: rgba(234,179,8,0.12); color: #eab308; }
  .badge.bad { background: rgba(239,68,68,0.14); color: #ef4444; }
  hr { border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 8px 0 22px; }
  .meta {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
    text-align: left; margin-bottom: 26px;
  }
  .meta-item {
    font-size: 13px; color: #d1d5db; line-height: 1.4;
    position: relative; padding-left: 14px;
  }
  .meta-item::before {
    content: ""; position: absolute; left: 0; top: 6px;
    width: 5px; height: 5px; border-radius: 50%; background: #3b82f6;
  }
  .meta-item .k { color: #9ca3af; }
  footer {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; color: #6b7280;
    padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06);
    text-align: left;
  }
  @media (max-width: 620px) {
    .metrics, .meta { grid-template-columns: repeat(2, 1fr); }
    .card { padding: 40px 24px 24px; }
    h1 { font-size: 24px; }
    footer { flex-direction: column; gap: 6px; align-items: flex-start; }
  }
</style>
</head>
<body>
  <main class="card">
    <div class="check">
      <svg viewBox="0 0 24 24" aria-hidden="true">${checkIcon}</svg>
    </div>
    <span class="pill">${escape(status.headline)}</span>
    <h1>Spendly Server</h1>
    <p class="lead">${escape(status.summary)}</p>

    <section class="metrics">
      <div class="metric">
        <div class="label">Uptime</div>
        <div class="value">${escape(status.uptime)}</div>
        <span class="badge ok">Excellent</span>
      </div>
      <div class="metric">
        <div class="label">Response Time</div>
        <div class="value">${escape(status.responseMs)} ms</div>
        <span class="badge ok">Optimal</span>
      </div>
      <div class="metric">
        <div class="label">Server Load</div>
        <div class="value">${escape(status.load.label)}</div>
        ${loadBadge}
      </div>
      <div class="metric">
        <div class="label">Database</div>
        <div class="value">${escape(status.db.label)}</div>
        ${dbBadge}
      </div>
    </section>

    <hr />

    <section class="meta">
      <div class="meta-item"><span class="k">Environment:</span><br />${escape(status.environment)}</div>
      <div class="meta-item"><span class="k">Runtime:</span><br />${escape(status.runtime)}</div>
      <div class="meta-item"><span class="k">Framework:</span><br />${escape(status.framework)}</div>
      <div class="meta-item"><span class="k">Region:</span><br />${escape(status.region)}</div>
    </section>

    <footer>
      <span>Spendly Backend Infrastructure</span>
      <span>Last checked: ${escape(status.checkedAt.toLocaleTimeString())}</span>
    </footer>
  </main>
</body>
</html>`;
};

export const statusHandler = (req, res) => {
  const startedAt = Date.now();
  const status = collectStatus(startedAt);
  const httpStatus = status.ok ? 200 : status.db.ok ? 200 : 503;

  if (req.accepts(['html', 'json']) === 'json') {
    res.status(httpStatus).json({
      status: status.ok ? 'ok' : 'degraded',
      headline: status.headline,
      uptimeSeconds: Math.floor(process.uptime()),
      uptime: status.uptime,
      responseMs: status.responseMs,
      load: status.load,
      database: status.db,
      environment: status.environment,
      runtime: status.runtime,
      framework: status.framework,
      region: status.region,
      checkedAt: status.checkedAt.toISOString(),
    });
    return;
  }

  res.status(httpStatus).type('html').send(renderStatusHtml(status));
};
