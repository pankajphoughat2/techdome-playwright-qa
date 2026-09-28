/**
 * techdome.io QA runner: a Cloudflare Worker that lets a reviewer start the Playwright
 * suite on GitHub Actions and watch it run, then open the HTML report on GitHub Pages.
 *
 *   GET  /               the UI (below)
 *   GET  /api/config     public config for the UI
 *   GET  /api/history    last 10 runs + their published summary.json
 *   POST /api/run        start a run   { suite, key? }
 *   GET  /api/run/:id    live status of one run, mapped to UI stages
 *
 * Guards on POST /api/run (the 5-user load limit must hold even for a public button):
 *   1. refuses while any run is queued / in progress   → 409
 *   2. refuses within COOLDOWN_MINUTES of the last run  → 429
 *   3. optional RUN_KEY passcode                        → 401
 *   4. same-origin check against cross-site POSTs       → 403
 * The workflow's `concurrency` group is the backstop if two requests race past 1.
 */

const GH = 'https://api.github.com';
const ACTIVE = new Set(['queued', 'in_progress', 'waiting', 'requested', 'pending']);
const SUITES = ['all', 'e2e', 'integration', 'security', 'load'];

// Workflow step names (see .github/workflows/e2e.yml) → UI stages.
const STAGES = [
  { key: 'queued', label: 'Queued on GitHub', detail: 'Waiting for a runner', steps: [] },
  { key: 'setup', label: 'Machine set up', detail: 'Checkout, Node.js and packages', steps: ['Set up job', 'Check out repository', 'Set up Node.js', 'Install packages'] },
  { key: 'browser', label: 'Chromium installed', detail: 'The browser Playwright drives', steps: ['Install Chromium'] },
  { key: 'tests', label: 'Tests running', detail: 'E2E → integration → security, then load (5 users) alone', steps: ['Run tests'] },
  { key: 'publish', label: 'Report published', detail: 'HTML report + traceability on GitHub Pages', steps: ['Write job summary', 'Assemble report site', 'Publish report to GitHub Pages'] },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/' && request.method === 'GET') return html(page(env));
      if (url.pathname === '/api/config') return json(publicConfig(env));
      if (url.pathname === '/api/history') return json(await history(env));
      if (url.pathname === '/api/run' && request.method === 'POST') return await startRun(request, env, url);
      const m = url.pathname.match(/^\/api\/run\/(\d+)$/);
      if (m) return json(await runStatus(env, m[1]));
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: err.message || 'Unexpected error' }, err.status || 500);
    }
  },
};

// ── GitHub helpers ─────────────────────────────────────────────────────────────

async function gh(env, path, init = {}) {
  if (!env.GITHUB_TOKEN) throw httpError(500, 'GITHUB_TOKEN secret is not set on the Worker.');
  const res = await fetch(`${GH}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'techdome-qa-runner',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw httpError(502, `GitHub API ${res.status}: ${body.message || 'request failed'}`);
  return body;
}

const listRuns = (env, n = 10) =>
  gh(env, `/actions/workflows/${env.WORKFLOW_FILE}/runs?per_page=${n}`).then((r) => r.workflow_runs || []);

function shapeRun(env, r) {
  const started = r.run_started_at || r.created_at;
  const end = ACTIVE.has(r.status) ? null : r.updated_at;
  return {
    id: r.id,
    number: r.run_number,
    status: r.status,
    conclusion: r.conclusion,
    event: r.event,
    createdAt: r.created_at,
    durationMs: end ? new Date(end) - new Date(started) : null,
    sha: r.head_sha?.slice(0, 7),
    actionsUrl: r.html_url,
    reportUrl: `${env.PAGES_BASE}/runs/${r.id}/`,
  };
}

async function summaryFor(env, runId) {
  // Published by the workflow next to the HTML report. Cached: a finished run never changes.
  const cache = caches.default;
  const key = new Request(`${env.PAGES_BASE}/runs/${runId}/summary.json`);
  const hit = await cache.match(key);
  if (hit) return hit.json();
  const res = await fetch(key, { cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (data) await cache.put(key, new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'max-age=86400' } }));
  return data;
}

// ── Routes ────────────────────────────────────────────────────────────────────

function publicConfig(env) {
  return {
    repoUrl: `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`,
    pagesBase: env.PAGES_BASE,
    requiresKey: Boolean(env.RUN_KEY),
    cooldownMinutes: Number(env.COOLDOWN_MINUTES || 10),
    suites: SUITES,
    stages: STAGES.map(({ key, label, detail }) => ({ key, label, detail })),
  };
}

async function history(env) {
  const runs = (await listRuns(env, 10)).map((r) => shapeRun(env, r));
  const summaries = await Promise.all(runs.map((r) => (ACTIVE.has(r.status) ? null : summaryFor(env, r.id).catch(() => null))));
  return { runs: runs.map((r, i) => ({ ...r, summary: summaries[i] })) };
}

async function startRun(request, env, url) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) throw httpError(403, 'Cross-site requests are not allowed.');

  const body = await request.json().catch(() => ({}));
  const suite = SUITES.includes(body.suite) ? body.suite : 'all';
  if (env.RUN_KEY && !timingSafeEqual(String(body.key || ''), env.RUN_KEY)) throw httpError(401, 'Wrong or missing run key.');

  const recent = await listRuns(env, 5);
  const active = recent.find((r) => ACTIVE.has(r.status));
  if (active) {
    return json({ error: 'A run is already in progress. Runs are serialised so the live site never sees more than 5 load-test users.', runId: active.id }, 409);
  }
  const cooldownMs = Number(env.COOLDOWN_MINUTES || 10) * 60_000;
  const last = recent[0];
  if (last && Date.now() - new Date(last.created_at) < cooldownMs) {
    const waitMin = Math.ceil((cooldownMs - (Date.now() - new Date(last.created_at))) / 60_000);
    return json({ error: `Cool-down: the last run started under ${env.COOLDOWN_MINUTES} min ago. Try again in ~${waitMin} min.`, retryAfterMinutes: waitMin }, 429);
  }

  const dispatchedAt = Date.now();
  await gh(env, `/actions/workflows/${env.WORKFLOW_FILE}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref: env.GITHUB_REF || 'main', inputs: { suite } }),
  });

  // The dispatch API returns 204 with no run id; find the run it created.
  for (let i = 0; i < 10; i++) {
    await sleep(1500);
    const run = (await listRuns(env, 5)).find((r) => r.event === 'workflow_dispatch' && new Date(r.created_at) >= dispatchedAt - 15_000);
    if (run) return json({ runId: run.id, suite }, 202);
  }
  return json({ runId: null, suite, note: 'Dispatched. GitHub has not listed the run yet; it will appear in the history shortly.' }, 202);
}

async function runStatus(env, id) {
  const [run, jobs] = await Promise.all([gh(env, `/actions/runs/${id}`), gh(env, `/actions/runs/${id}/jobs`)]);
  const steps = (jobs.jobs?.[0]?.steps || []);
  const stageStatus = STAGES.map((stage) => {
    if (stage.key === 'queued') {
      return { key: stage.key, state: run.status === 'queued' || run.status === 'waiting' ? 'active' : 'done' };
    }
    const mine = steps.filter((s) => stage.steps.includes(s.name));
    let state = 'pending';
    if (mine.some((s) => s.status === 'in_progress')) state = 'active';
    else if (mine.length && mine.every((s) => s.status === 'completed')) {
      state = mine.some((s) => s.conclusion === 'failure') ? 'failed' : 'done';
    }
    // "Run tests" is continue-on-error; the job's last step decides pass/fail.
    if (stage.key === 'tests' && state === 'done' && run.conclusion === 'failure') state = 'failed';
    return { key: stage.key, state };
  });
  const shaped = shapeRun(env, run);
  const summary = ACTIVE.has(run.status) ? null : await summaryFor(env, id).catch(() => null);
  return { ...shaped, stages: stageStatus, summary };
}

// ── utils ─────────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
function html(body) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}
function httpError(status, message) { const e = new Error(message); e.status = status; return e; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── UI ────────────────────────────────────────────────────────────────────────

export function page(env) {
  const cfg = JSON.stringify(publicConfig(env)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>techdome.io QA Runner</title>
<meta name="description" content="Run the techdome.io Playwright suite on GitHub Actions and open the report.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>
:root{--bg:#f7f8fa;--card:#fff;--ink:#0f172a;--ink2:#334155;--ink3:#5b6474;--line:#e3e7ee;--accent:#4f46e5;--accent-ink:#fff;--ok:#0f7b4f;--ok-bg:#e7f6ef;--bad:#b42318;--bad-bg:#fdecea;--warn:#8a5a00;--warn-bg:#fff4dc;--bug:#6b3fa0;--bug-bg:#f1eafb;--mono:'JetBrains Mono',ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0b0f17;--card:#131a26;--ink:#e8edf5;--ink2:#c3cbd8;--ink3:#8f9aab;--line:#243044;--accent:#8b85ff;--accent-ink:#0b0f17;--ok:#4cd39b;--ok-bg:#0f2a20;--bad:#ff8a80;--bad-bg:#2c1414;--warn:#f5c76b;--warn-bg:#2a2210;--bug:#c9a6ff;--bug-bg:#231a33}}
:root[data-theme=dark]{--bg:#0b0f17;--card:#131a26;--ink:#e8edf5;--ink2:#c3cbd8;--ink3:#8f9aab;--line:#243044;--accent:#8b85ff;--accent-ink:#0b0f17;--ok:#4cd39b;--ok-bg:#0f2a20;--bad:#ff8a80;--bad-bg:#2c1414;--warn:#f5c76b;--warn-bg:#2a2210;--bug:#c9a6ff;--bug-bg:#231a33}
*{box-sizing:border-box}html,body{margin:0}body{background:var(--bg);color:var(--ink);font:15px/1.5 Inter,system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:32px 16px 64px}
a{color:var(--accent)}h1{font-size:28px;line-height:1.2;margin:0 0 6px;letter-spacing:-.01em}h2{font-size:17px;margin:0 0 14px}
.sub{color:var(--ink3);margin:0}.mono{font-family:var(--mono);font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;margin-top:18px}
.top{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
.badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--line);color:var(--ink2);background:var(--bg)}
.badge.ok{color:var(--ok);background:var(--ok-bg);border-color:transparent}.badge.bad{color:var(--bad);background:var(--bad-bg);border-color:transparent}
.badge.warn{color:var(--warn);background:var(--warn-bg);border-color:transparent}.badge.bug{color:var(--bug);background:var(--bug-bg);border-color:transparent}
.runbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:16px}
select,input{font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:9px 10px;min-height:42px}
button{font:inherit;font-weight:600;border:0;border-radius:8px;padding:10px 18px;min-height:42px;background:var(--accent);color:var(--accent-ink);cursor:pointer}
button:disabled{opacity:.55;cursor:not-allowed}button:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.timer{font-family:var(--mono);font-size:22px;color:var(--ink2);margin-left:auto}
.msg{margin-top:12px;font-size:14px}.msg.err{color:var(--bad)}
.stages{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}
.stage{display:grid;grid-template-columns:28px 1fr auto;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--line);border-radius:10px}
.dot{width:22px;height:22px;border-radius:50%;border:2px solid var(--line);display:grid;place-items:center;font-size:12px;font-weight:700}
.stage[data-state=active] .dot{border-color:var(--accent);border-top-color:transparent;animation:spin 1s linear infinite}
.stage[data-state=done] .dot{background:var(--ok);border-color:var(--ok);color:var(--card)}.stage[data-state=failed] .dot{background:var(--bad);border-color:var(--bad);color:var(--card)}
.stage b{display:block;font-weight:600}.stage span{color:var(--ink3);font-size:13px}.stage .st{font-size:12px;color:var(--ink3);text-transform:capitalize}
@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.stage[data-state=active] .dot{animation:none;border-top-color:var(--accent)}}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.stat{border:1px solid var(--line);border-radius:10px;padding:14px}.stat .v{font-size:24px;font-weight:700;letter-spacing:-.01em}.stat .k{font-size:12px;color:var(--ink3)}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:12px;color:var(--ink3);font-weight:600}
.tablewrap{overflow-x:auto}td.nw{white-space:nowrap}
.cover{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 22px;margin:0;padding:0;list-style:none}
.cover li{padding:10px 0;border-bottom:1px solid var(--line)}.cover b{display:block}.cover span{color:var(--ink3);font-size:13px}
.guard{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:10px;background:var(--ok-bg);color:var(--ink2);font-size:14px;margin-top:14px}
.links{display:flex;gap:14px;flex-wrap:wrap;font-size:14px}
.empty{color:var(--ink3);padding:14px 0}
@media (max-width:720px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cover{grid-template-columns:1fr}.timer{margin-left:0;width:100%}.hide-sm{display:none}}
</style>
</head>
<body>
<main>
  <header class="top">
    <div>
      <h1>techdome.io QA suite</h1>
      <p class="sub">Playwright end-to-end, integration, security and load tests against <a href="https://techdome.io" rel="noopener">techdome.io</a>, run on GitHub Actions.</p>
    </div>
    <span id="live" class="badge">Loading…</span>
  </header>

  <section class="card" aria-labelledby="run-h">
    <h2 id="run-h">Run the suite</h2>
    <div class="runbar">
      <label class="mono" for="suite">Suite</label>
      <select id="suite"></select>
      <input id="key" type="password" autocomplete="off" placeholder="Run key" aria-label="Run key" hidden>
      <button id="run" type="button">Run automation</button>
      <span class="timer" id="timer" aria-live="off">0:00</span>
    </div>
    <div class="guard" role="note">
      <span aria-hidden="true">🛡️</span>
      <span><b>Load-limit safe.</b> Only one run can be active at a time (enforced here and by the workflow's concurrency group), so techdome.io never sees more than the assignment's 5 concurrent load-test users. There's also a cool-down between runs.</span>
    </div>
    <p class="msg" id="msg" role="status" aria-live="polite"></p>
    <ol class="stages" id="stages" aria-label="Run progress"></ol>
  </section>

  <section class="card" aria-labelledby="stats-h">
    <h2 id="stats-h">Last 10 runs</h2>
    <div class="stats">
      <div class="stat"><div class="v" id="s-pass">–</div><div class="k">Runs green</div></div>
      <div class="stat"><div class="v" id="s-time">–</div><div class="k">Typical run time</div></div>
      <div class="stat"><div class="v" id="s-bugs">–</div><div class="k">Known bugs reproduced (latest)</div></div>
      <div class="stat"><div class="v" id="s-p95">–</div><div class="k">Load p95, 5 users (latest)</div></div>
    </div>
    <div class="tablewrap" style="margin-top:16px">
      <table>
        <thead><tr><th>Run</th><th>Started</th><th class="hide-sm">Trigger</th><th>Result</th><th>Tests</th><th>Links</th></tr></thead>
        <tbody id="rows"><tr><td colspan="6" class="empty">Loading recent runs…</td></tr></tbody>
      </table>
    </div>
    <p class="sub" style="margin-top:10px;font-size:13px">Each run keeps its own HTML report, traceability matrix and the commit it tested. 🐞 = a test that fails on purpose because it reproduces a bug documented in <span class="mono">docs/bugs.md</span>.</p>
  </section>

  <section class="card" aria-labelledby="cov-h">
    <h2 id="cov-h">What the automation checks</h2>
    <ul class="cover">
      <li><b>Every page resolves</b><span>23 core pages + all ~69 sitemap URLs, titles, h1, real 404s</span></li>
      <li><b>Conversion paths</b><span>Hero CTAs → contact, Calendly embed, email fallback</span></li>
      <li><b>Newsletter form</b><span>Validation, Enter key, double-submit, 429/500/offline, exact payload</span></li>
      <li><b>Pod AI chat</b><span>Request contract, history, focus handling, prompt-injected HTML stays inert</span></li>
      <li><b>Mobile &amp; tablet</b><span>375 px on all pages, 768 px, landscape, hamburger ARIA</span></li>
      <li><b>Accessibility</b><span>axe-core WCAG 2.1 AA, skip link, focus visibility, labels</span></li>
      <li><b>Security</b><span>Headers, real clickjacking attempt, CORS, secrets &amp; email leak scan</span></li>
      <li><b>Load, exactly 5 users</b><span>p95 &lt; 3 s, zero 5xx, measured by a live concurrency gauge</span></li>
    </ul>
    <div class="links" style="margin-top:14px" id="doclinks"></div>
  </section>
</main>
<script>
const CONFIG = ${cfg};
const $ = (id) => document.getElementById(id);
let pollTimer = null, tick = null, startedAt = null;

const fmtDur = (ms) => { if (ms == null) return '–'; const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); return h < 24 ? h + ' h ago' : Math.round(h / 24) + ' d ago'; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function init() {
  $('suite').innerHTML = CONFIG.suites.map((s) => '<option value="' + s + '">' + (s === 'all' ? 'Everything (recommended)' : s) + '</option>').join('');
  if (CONFIG.requiresKey) $('key').hidden = false;
  $('stages').innerHTML = CONFIG.stages.map((st) => '<li class="stage" data-key="' + st.key + '" data-state="pending"><div class="dot" aria-hidden="true"></div><div><b>' + esc(st.label) + '</b><span>' + esc(st.detail) + '</span></div><div class="st">pending</div></li>').join('');
  const r = CONFIG.repoUrl + '/blob/main/';
  $('doclinks').innerHTML = [['Repository', CONFIG.repoUrl], ['User story map', r + 'docs/user-story-map.md'], ['Bug report', r + 'docs/bugs.md'], ['Traceability', r + 'docs/traceability.md'], ['Load results', r + 'docs/load-test-results.md'], ['Workflow', r + '.github/workflows/e2e.yml']]
    .map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>').join('');
  $('run').addEventListener('click', start);
  loadHistory();
}

function setStages(stages) {
  for (const s of stages) {
    const li = document.querySelector('.stage[data-key="' + s.key + '"]');
    if (!li) continue;
    li.dataset.state = s.state;
    li.querySelector('.dot').textContent = s.state === 'done' ? '✓' : s.state === 'failed' ? '!' : '';
    li.querySelector('.st').textContent = s.state;
  }
}

function resultBadge(r) {
  if (r.status !== 'completed') return '<span class="badge warn">' + esc(r.status.replace('_', ' ')) + '</span>';
  return r.conclusion === 'success' ? '<span class="badge ok">Passed</span>' : '<span class="badge bad">' + esc(r.conclusion || 'failed') + '</span>';
}

function testsCell(s) {
  if (!s || !s.totals) return '<span class="sub">–</span>';
  const t = s.totals;
  return '<span class="mono">' + t.passed + ' ✅</span> · <span class="badge bug">' + t.knownBugs + ' 🐞</span>' + (t.flaky ? ' · ' + t.flaky + ' ⚠️' : '') + (t.failed ? ' · <b style="color:var(--bad)">' + t.failed + ' ❌</b>' : '');
}

async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const runs = data.runs;
    const active = runs.find((r) => r.status !== 'completed');
    $('live').className = 'badge ' + (active ? 'warn' : 'ok');
    $('live').textContent = active ? 'Run in progress' : 'Idle, ready to run';
    if (active && !pollTimer) follow(active.id, new Date(active.createdAt));
    if (!runs.length) { $('rows').innerHTML = '<tr><td colspan="6" class="empty">No runs yet. Start the first one above.</td></tr>'; return; }
    $('rows').innerHTML = runs.map((r) => '<tr><td class="mono">#' + r.number + '<br><span class="sub">' + esc(r.sha) + '</span></td><td>' + ago(r.createdAt) + '<br><span class="sub">' + fmtDur(r.durationMs) + '</span></td><td class="hide-sm">' + esc(r.event.replace('workflow_dispatch', 'manual')) + '</td><td>' + resultBadge(r) + '</td><td class="nw">' + testsCell(r.summary) + '</td><td class="nw">' + (r.status === 'completed' ? '<a href="' + r.reportUrl + '" target="_blank" rel="noopener">Report</a> · ' : '') + '<a href="' + r.actionsUrl + '" target="_blank" rel="noopener">Actions</a></td></tr>').join('');
    const done = runs.filter((r) => r.status === 'completed');
    $('s-pass').textContent = done.length ? done.filter((r) => r.conclusion === 'success').length + '/' + done.length : '–';
    const durs = done.map((r) => r.durationMs).filter(Boolean).sort((a, b) => a - b);
    $('s-time').textContent = durs.length ? fmtDur(durs[Math.floor(durs.length / 2)]) : '–';
    const latest = done.find((r) => r.summary && r.summary.totals);
    $('s-bugs').textContent = latest ? (latest.summary.bugsConfirmedThisRun || []).length : '–';
    const p95 = latest && Object.entries(latest.summary.metrics || {}).find(([k]) => k.startsWith('p95:'));
    $('s-p95').textContent = p95 ? p95[1].split(' ')[0] + ' ms' : '–';
  } catch (e) {
    $('rows').innerHTML = '<tr><td colspan="6" class="empty">Could not load runs: ' + esc(e.message) + '</td></tr>';
  }
}

async function start() {
  $('run').disabled = true;
  $('msg').className = 'msg'; $('msg').textContent = 'Starting a run on GitHub Actions…';
  try {
    const res = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suite: $('suite').value, key: $('key').value }) });
    const data = await res.json();
    if (res.status === 409 && data.runId) { $('msg').textContent = data.error + ' Following it instead.'; follow(data.runId, new Date()); return; }
    if (!res.ok) throw new Error(data.error || 'Could not start the run');
    $('msg').textContent = data.runId ? 'Run started. Live progress below.' : data.note;
    if (data.runId) follow(data.runId, new Date()); else { $('run').disabled = false; setTimeout(loadHistory, 5000); }
  } catch (e) {
    $('msg').className = 'msg err'; $('msg').textContent = e.message; $('run').disabled = false;
  }
}

function follow(id, since) {
  $('run').disabled = true;
  startedAt = since;
  clearInterval(tick); tick = setInterval(() => { $('timer').textContent = fmtDur(Date.now() - startedAt); }, 1000);
  const poll = async () => {
    try {
      const res = await fetch('/api/run/' + id);
      const r = await res.json();
      if (!res.ok) throw new Error(r.error);
      setStages(r.stages);
      if (r.status === 'completed') {
        clearInterval(tick); clearTimeout(pollTimer); pollTimer = null;
        $('timer').textContent = fmtDur(r.durationMs);
        $('msg').className = 'msg' + (r.conclusion === 'success' ? '' : ' err');
        $('msg').innerHTML = (r.conclusion === 'success' ? 'Run passed. ' : 'Run finished with failures. ') + '<a href="' + r.reportUrl + '" target="_blank" rel="noopener">Open the report</a> (GitHub Pages can take ~1 min to publish) · <a href="' + r.actionsUrl + '" target="_blank" rel="noopener">Actions log</a>';
        $('run').disabled = false;
        loadHistory();
        return;
      }
      pollTimer = setTimeout(poll, 5000);
    } catch (e) {
      $('msg').className = 'msg err'; $('msg').textContent = 'Lost track of the run: ' + e.message; pollTimer = setTimeout(poll, 10000);
    }
  };
  poll();
}

init();
</script>
</body>
</html>`;
}
