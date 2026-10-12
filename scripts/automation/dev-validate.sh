#!/usr/bin/env bash
# DEV ONLY. No service restarts, HA calls, or production mutation.
set -euo pipefail
export PATH=/usr/local/bin:/usr/bin:/bin
export GIT_TERMINAL_PROMPT=0
export GIT_CONFIG_NOSYSTEM=0
# Ignore unrelated system-wide OpenSSH proxy include with invalid ownership.
# Keep SSH host verification enforced; no agent or global config changes.
export GIT_SSH_COMMAND="/usr/bin/ssh -F none -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=20"
umask 077
repo="$HOME/projects/rs-home-ai-dev"
state="$HOME/.local/state/rs-home-ai-dev-automation"
mkdir -p "$state" "$HOME/projects/rs-home-ai-v3-candidates"
export npm_config_cache="$state/npm-cache"
exec 9>"$state/lock"
flock -n 9 || { echo "Another DEV validation is running"; exit 0; }
stamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
status="$state/latest.txt"
result="failed"
head="unknown"
stage="preflight"
report(){
 rc=$?
 [[ $rc -eq 0 ]] && result="passed"
 printf 'time_utc=%s\nstatus=%s\nstage=%s\nsource_sha=%s\nexit_code=%s\n' "$stamp" "$result" "$stage" "$head" "$rc" > "$status"
 echo "DEV_AUTOMATION result=$result stage=$stage sha=$head exit=$rc"
}
trap report EXIT
[[ -d "$repo/.git" ]] || { echo "DENY: missing canonical DEV"; exit 1; }
cd "$repo"
[[ "$(git branch --show-current)" == "feature/v3-home-agent" ]] || { echo "DENY: unexpected branch"; exit 1; }
[[ -z "$(git status --porcelain=v1)" ]] || { echo "DENY: dirty DEV (preserved)"; exit 1; }
stage="fetch"
# Keep Git/SSH diagnostics private; do not echo potentially sensitive remote output.
fetch_errors="$state/fetch-stderr.log"
if ! git -c core.askPass= -c credential.interactive=never fetch --no-tags origin feature/v3-home-agent 2>"$fetch_errors"; then
 reason="git_fetch_failed"
 if grep -qi 'Permission denied (publickey)' "$fetch_errors"; then reason="ssh_publickey_denied"
 elif grep -qi 'Host key verification failed' "$fetch_errors"; then reason="ssh_host_key_untrusted"
 elif grep -Eqi 'Could not resolve hostname|Temporary failure in name resolution' "$fetch_errors"; then reason="dns_unavailable"
 elif grep -Eqi 'Could not open a connection to your authentication agent|sign_and_send_pubkey.*agent refused operation' "$fetch_errors"; then reason="ssh_agent_unavailable"
 elif grep -qi 'Network is unreachable' "$fetch_errors"; then reason="network_unreachable"
 fi
 printf 'fetch_reason=%s\n' "$reason" > "$state/fetch-reason.txt"
 echo "DENY: fetch failed: $reason; private details kept on Pi in automation state"
 exit 128
fi
rm -f "$fetch_errors" "$state/fetch-reason.txt"
remote="$(git rev-parse --verify refs/remotes/origin/feature/v3-home-agent)"
head="$(git rev-parse --verify HEAD)"
stage="fast-forward"
git merge-base --is-ancestor "$head" "$remote" || { echo "DENY: diverged DEV"; exit 1; }
git merge --ff-only "$remote"
head="$(git rev-parse HEAD)"
stage="ci_gate"
# No privileged policy/security tests under user-systemd UID remapping.
# Verify exact HEAD with GitHub's private Actions API using read-only token.
ci_token="$HOME/.config/rs-home-ai-dev/ci-token"
timeout --signal=TERM --kill-after=5s 45s node scripts/automation/verify-github-ci.mjs "$head" "$ci_token" || {
 echo "DENY: exact commit GitHub CI gate not verified"
 exit 1
}
stage="local_syntax"
# Candidate script independently validates syntax and installs locked deps.
stage="candidate"
target="$HOME/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-${head:0:7}"
if [[ -e "$target" ]]; then
 [[ -f "$target/RELEASE_COMMIT" && "$(cat "$target/RELEASE_COMMIT")" == "$head" ]] || { echo "DENY: candidate collision"; exit 1; }
 echo "Candidate exists for commit; leave unchanged"
else
 timeout --signal=TERM --kill-after=10s 240s env RS_V3_CANDIDATE_ROOT="$HOME/projects/rs-home-ai-v3-candidates" bash scripts/prepare-v3-release-candidate.sh
fi
stage="complete"
echo "Candidate ready for MANUAL REVIEW ONLY; production not modified."
