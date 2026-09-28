# Setting up the "Run it yourself" page

A Cloudflare Worker serves a page with a **Run automation** button. Clicking it starts the Playwright suite on GitHub Actions, the page shows live progress, and each run's HTML report is published to GitHub Pages at `…/runs/<run-id>/`.

```
Reviewer ──click──▶ Cloudflare Worker ──workflow_dispatch──▶ GitHub Actions ──runs──▶ techdome.io
    ▲                    │  (holds the GitHub token)             │
    └── live status ─────┘◀───────── run / job / step API ───────┘
                                                                 └──push report──▶ gh-pages ─▶ GitHub Pages
```

Time needed: about 20 minutes, once. Everything is on free tiers.

---

## 1. Push the repo to GitHub

```bash
git add -A
git commit -m "techdome.io Playwright QA suite"
gh repo create techdome-playwright-qa --public --source . --push
```

(Or create an empty repo on github.com and `git remote add origin … && git push -u origin main`.)

The repo must be **public** for the reviewers, and for GitHub Pages on a free plan.

## 2. Let the workflow publish reports

1. Repo → **Settings → Actions → General → Workflow permissions** → select **Read and write permissions** → Save.
   (The workflow pushes each report to the `gh-pages` branch.)
2. Repo → **Actions** tab → if asked, click **"I understand my workflows, go ahead and enable them"**.
3. Run it once by hand: **Actions → techdome.io QA suite → Run workflow → suite: all → Run workflow**.
   Wait for it to finish (~6–8 min). This first run creates the `gh-pages` branch.
4. Repo → **Settings → Pages** → **Source: Deploy from a branch** → Branch **`gh-pages`**, folder **`/ (root)`** → Save.
5. After a minute, open `https://<your-username>.github.io/techdome-playwright-qa/runs/<run-id>/`. The run id is the number in the Actions run URL. You should see the Playwright HTML report.

## 3. Create a GitHub token for the Worker

Use a **fine-grained** token scoped to this one repo. Never use a classic token with `repo` scope, which would work for all your repos.

1. GitHub → avatar → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. **Repository access:** *Only select repositories* → `techdome-playwright-qa`
3. **Repository permissions:**
   - **Actions: Read and write** (start runs, read their status)
   - **Metadata: Read-only** (added automatically)
4. Expiration: until after the hiring process (e.g. 60 days).
5. Copy the token (`github_pat_…`). You'll paste it in step 5. Don't put it in any file.

## 4. Configure the Worker

Edit `worker/wrangler.toml` and fill in the three values at the top:

```toml
GITHUB_OWNER = "your-github-username"
GITHUB_REPO  = "techdome-playwright-qa"
PAGES_BASE   = "https://your-github-username.github.io/techdome-playwright-qa"
```

`COOLDOWN_MINUTES` (default 10) is the minimum gap between runs started from the page.

## 5. Deploy to Cloudflare

```bash
cd worker
npm install
npx wrangler login
```

`wrangler login` opens a browser. Create a free Cloudflare account if you don't have one and approve.

```bash
npx wrangler secret put GITHUB_TOKEN
```

Paste the token from step 3 when prompted. It's stored encrypted in Cloudflare, never in the repo.

Optional: require a passcode to start runs, so strangers can't trigger them. Share it with the reviewers in your email.

```bash
npx wrangler secret put RUN_KEY
```

Deploy:

```bash
npx wrangler deploy
```

Wrangler prints the URL, e.g. `https://techdome-qa-runner.<your-subdomain>.workers.dev`. Open it.

## 6. Check it works

1. The page loads and "Last 10 runs" lists the run from step 2.3, with ✅/🐞 counts.
2. Click **Run automation**. Within ~10 s the "Queued on GitHub" stage should turn green, then the others follow.
3. Click **Run automation** again while it's running. You should get *"A run is already in progress…"*. That's the 5-user guard working.
4. When it finishes, **Report** opens the new HTML report. Pages may need ~1 minute to publish.

## 7. Put the link in your submission

Add the Worker URL to the top of `README.md` and to your email:

```md
**▶ Run it yourself:** https://techdome-qa-runner.<your-subdomain>.workers.dev
```

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| "GITHUB_TOKEN secret is not set" | Run `npx wrangler secret put GITHUB_TOKEN` in `worker/`, then `npx wrangler deploy` again |
| "GitHub API 404" | `GITHUB_OWNER` / `GITHUB_REPO` typo, or the token doesn't include this repo |
| "GitHub API 403 Resource not accessible" | Token is missing **Actions: Read and write** |
| "GitHub API 422 … workflow_dispatch" | Workflow file isn't on the `main` branch, or the branch is called `master`. Set `GITHUB_REF` in `wrangler.toml` |
| Report link is 404 | Pages not enabled (step 2.4), or wait ~1 minute after the run for Pages to publish |
| Tests column shows "–" | That run finished before summaries existed, or Pages hasn't published `summary.json` yet |
| Run never starts | Actions disabled on the repo (step 2.2), or GitHub is queueing: check the Actions tab |

## Why it's built this way

- **The token never reaches the browser.** The Worker is the only thing that talks to GitHub. The page calls only `/api/*` on its own origin, and it sends a strict CSP.
- **The 5-user limit holds even for a public button.** The Worker refuses to start a run while another is queued or running (HTTP 409), enforces a cool-down (429), and the workflow's `concurrency` group queues any run that slips through. Two load tests can never overlap.
- **Every report is kept.** Reports go to `runs/<run-id>/` with `keep_files`, next to `run.json`, which records the exact commit tested.
- **Daily schedule.** The workflow also runs every morning. When Techdome fixes a bug, its known-bug test reports "expected to fail but passed" and the run goes red, which tells you to update `docs/bugs.md`.
