#!/usr/bin/env node
// Manual-only: send a strictly allowlisted Pi diagnostic via outbound HTTPS.
// WARNING: GitHub issue comments in a public repository are public.
import { readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const EXPECTED_REPO = 'drpoh/ha-telegram-bot';
const tokenPath = process.env.RS_PI_GITHUB_TOKEN_FILE ||
  '/home/drpoh/.config/rs-home-ai-gh-report/token';
const issueText = process.env.RS_PI_GITHUB_REPORT_ISSUE;
if (!/^[1-9][0-9]{0,7}$/.test(issueText ?? '')) {
  console.error('REPORT=missing_issue_number');
  process.exit(2);
}
if (process.env.RS_PI_GITHUB_REPORT_CONFIRM !== 'PUBLIC_READONLY_REPORT') {
  console.error('REPORT=requires_public_report_confirmation');
  process.exit(2);
}
const tokenMode = statSync(tokenPath).mode & 0o777;
if ((tokenMode & 0o077) !== 0) {
  console.error('REPORT=token_file_permissions_too_open');
  process.exit(2);
}
const token = readFileSync(tokenPath, 'utf8').trim();
if (!/^[A-Za-z0-9_]{20,}$/.test(token)) {
  console.error('REPORT=invalid_token_format');
  process.exit(2);
}
const diagnostic = execFileSync('/home/drpoh/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh', [], {
  encoding: 'utf8', timeout: 20000, maxBuffer: 8192,
  env: { ...process.env, SSH_ORIGINAL_COMMAND: 'diagnose-v1' },
});
const rules = new Map([
  ['DIAG_VERSION', /^1$/],
  ['DEV_BRANCH', /^[A-Za-z0-9._/-]{1,100}$/],
  ['DEV_HEAD', /^[a-f0-9]{7,40}$/],
  ['DEV_TRACKED_TREE', /^(clean|modified)$/],
  ['V3_SERVICE', /^(active|inactive|failed|activating|deactivating|unknown)$/],
  ['DEV_CHECK_TIMER', /^(active|inactive|failed|activating|deactivating|unknown)$/],
  ['V2_SERVICE', /^(active|inactive|failed|activating|deactivating|unknown)$/],
  ['HA_MCP_HTTP', /^(reachable|unverified)$/],
  ['HA_WRITES', /^none$/],
]);
const values = new Map();
for (const line of diagnostic.trim().split(/\r?\n/)) {
  const match = /^([A-Z_]+)=(.*)$/.exec(line);
  if (!match || !rules.has(match[1]) || !rules.get(match[1]).test(match[2]) || values.has(match[1])) {
    console.error('REPORT=unexpected_diagnostic_output');
    process.exit(2);
  }
  values.set(match[1], match[2]);
}
if (values.size !== rules.size || values.get('HA_WRITES') !== 'none') {
  console.error('REPORT=incomplete_diagnostic');
  process.exit(2);
}
const body = [
  'RS Home AI Raspberry Pi — manual read-only status',
  '',
  '```text',
  ...[...rules.keys()].map(key => `${key}=${values.get(key)}`),
  '```',
  '',
  'No HA writes; HA_MCP_HTTP is connectivity-only, not authenticated readiness.',
].join('\n');
const response = await fetch(
  `https://api.github.com/repos/${EXPECTED_REPO}/issues/${issueText}/comments`, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'rs-home-ai-pi-readonly-diagnostics',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({body}),
    signal: AbortSignal.timeout(20000),
  },
);
if (!response.ok) {
  console.error(`REPORT=github_http_${response.status}`);
  process.exit(1);
}
const json = await response.json();
if (json?.html_url?.startsWith(`https://github.com/${EXPECTED_REPO}/issues/`)) {
  console.log('REPORT=sent');
  console.log(`REPORT_URL=${json.html_url}`);
} else {
  console.error('REPORT=unexpected_github_response');
  process.exit(1);
}
