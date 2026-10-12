#!/usr/bin/env bash
# DEV ONLY. No service restarts, HA calls, or production mutation.
set -euo pipefail
export PATH=/usr/local/bin:/usr/bin:/bin
export GIT_TERMINAL_PROMPT=0
export GIT_CONFIG_NOSYSTEM=0
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
git fetch --no-tags origin feature/v3-home-agent
remote="$(git rev-parse --verify refs/remotes/origin/feature/v3-home-agent)"
head="$(git rev-parse --verify HEAD)"
stage="fast-forward"
git merge-base --is-ancestor "$head" "$remote" || { echo "DENY: diverged DEV"; exit 1; }
git merge --ff-only "$remote"
head="$(git rev-parse HEAD)"
stage="tests"
timeout --signal=TERM --kill-after=10s 900s npm test
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
