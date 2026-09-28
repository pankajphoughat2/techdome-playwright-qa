import { defineConfig, devices } from '@playwright/test';
import { MAX_CONCURRENT_USERS } from './utils/helpers';

/**
 * Techdome.io QA suite.
 *
 * Concurrency budget (hard constraint from the assignment: never more than 5
 * concurrent users against techdome.io):
 *   - Functional projects (e2e / integration / security) run with at most 4 workers.
 *   - The `load` project depends on the functional projects, so Playwright only
 *     starts it once they have finished. It then runs alone, simulating exactly
 *     MAX_CONCURRENT_USERS (5) users inside a single worker.
 *   - `workers` is clamped so an env override can never push it above the cap.
 */
const requestedWorkers = Number(process.env.WORKERS ?? 4);
const workers = Math.max(1, Math.min(requestedWorkers, MAX_CONCURRENT_USERS - 1));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry absorbs genuine network blips on a live site. A retried pass is
  // reported as "flaky", so it is still visible in the report.
  retries: 1,
  workers,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['./reporters/traceability-reporter.ts'],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://techdome.io',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'integration',
      testDir: './tests/integration',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'security',
      testDir: './tests/security',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'load',
      testDir: './tests/load',
      dependencies: ['e2e', 'integration', 'security'],
      fullyParallel: false,
      timeout: 5 * 60_000,
      retries: 0, // a load run is a measurement; retrying it would hide a bad run
      use: { ...devices['Desktop Chrome'] },
    },
    // Opt-in projects: never part of the default `npx playwright test`.
    ...(process.env.EVIDENCE
      ? [{ name: 'evidence', testDir: './evidence', retries: 0, use: { ...devices['Desktop Chrome'] } }]
      : []),
    // Real mobile Safari engine for the phone persona. Needs `npx playwright install webkit`.
    ...(process.env.CROSS_BROWSER
      ? [{ name: 'mobile-safari', testDir: './tests/e2e', testMatch: /(mobile|homepage|ctas|newsletter-form)\.spec\.ts/, use: { ...devices['iPhone 13'] } }]
      : []),
  ],
});
