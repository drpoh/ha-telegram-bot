#!/usr/bin/env bash
# PREPARE ONLY. Never changes systemd, current release, HA, or Telegram.
set -euo pipefail
repo="/home/drpoh/projects/rs-home-ai-dev"
root="${RS_V3_CANDIDATE_ROOT:-/home/drpoh/projects}"
[[ -d "$root" && ! -L "$root" ]] || { echo "DENY: release root missing or symbolic link" >&2; exit 1; }
cd "$repo"
[[ "$(git branch --show-current)" == "feature/v3-home-agent" ]] || { echo "DENY: wrong branch" >&2; exit 1; }
[[ -z "$(git status --porcelain=v1)" ]] || { echo "DENY: dirty DEV" >&2; exit 1; }
sha="$(git rev-parse --verify HEAD)"
short="${sha:0:7}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "DENY: bad commit ID" >&2; exit 1; }
[[ "$sha" == "$(git rev-parse origin/feature/v3-home-agent)" ]] || { echo "DENY: local DEV differs from fetched origin" >&2; exit 1; }
target="$root/rs-home-ai-v3-release-$short"
[[ ! -e "$target" ]] || { echo "DENY: release already exists: $target" >&2; exit 1; }
temp="$(mktemp -d "$root/.rs-home-ai-v3-stage-$short.XXXXXXXX")"
trap 'rm -rf -- "$temp"' EXIT
git archive --format=tar "$sha" | tar -xf - -C "$temp"
printf '%s\n' "$sha" > "$temp/RELEASE_COMMIT"
(
 cd "$temp"
 npm ci --omit=dev --ignore-scripts --no-audit --no-fund
 node --check src/pilot/telegram-readonly.mjs
 node --check src/home/sauna-status.mjs
 node --check src/home/tambour-light-status.mjs
 node --check src/home/light-overview.mjs
 node --check src/pilot/kitchen-mcp-client.mjs
)
mv -- "$temp" "$target"
trap - EXIT
printf 'CANDIDATE=%s\nCOMMIT=%s\n' "$target" "$sha"
printf '%s\n' "NOT DEPLOYED. Existing systemd ExecStart and live release were not modified."
