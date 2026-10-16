#!/usr/bin/env bash
# Fixed SSH forced command. Never evaluates caller-supplied input or writes to HA.
set -euo pipefail
case "${SSH_ORIGINAL_COMMAND:-}" in
  diagnose-v1) ;;
  *) echo "DIAG=DENIED"; exit 2 ;;
esac
export PATH="/usr/local/bin:/usr/bin:/bin"
export LC_ALL=C
export HOME="/home/drpoh"
unset GIT_ASKPASS SSH_ASKPASS
dev="/home/drpoh/projects/rs-home-ai-dev"
printf 'DIAG_VERSION=1\n'
if [[ -d "$dev/.git" ]]; then
  printf 'DEV_BRANCH='
  git -C "$dev" branch --show-current 2>/dev/null || echo unknown
  printf 'DEV_HEAD='
  git -C "$dev" rev-parse --short=12 HEAD 2>/dev/null || echo unknown
  if [[ -z "$(git -C "$dev" status --porcelain --untracked-files=no 2>/dev/null)" ]]; then
    echo "DEV_TRACKED_TREE=clean"
  else
    echo "DEV_TRACKED_TREE=modified"
  fi
else
  echo "DEV=missing"
fi
unit_state() {
  local scope="$1" unit="$2" label="$3" result
  if [[ "$scope" == user ]]; then
    result="$(systemctl --user is-active "$unit" 2>/dev/null || true)"
  else
    result="$(systemctl is-active "$unit" 2>/dev/null || true)"
  fi
  case "$result" in
    active|inactive|failed|activating|deactivating) ;;
    *) result=unknown ;;
  esac
  printf '%s=%s\n' "$label" "$result"
}
unit_state user "rs-home-ai-v3.service" V3_SERVICE
unit_state user "rs-home-ai-dev-check.timer" DEV_CHECK_TIMER
unit_state system "ha-telegram-bot.service" V2_SERVICE

# HTTP connectivity only, NOT authenticated MCP API acceptance; never emit URL.
mcp_result="$(node --input-type=module -e '
import {readFileSync} from "node:fs";
const file="/home/drpoh/.config/rs-home-ai-v3/mcp-url";
try {
 const raw=readFileSync(file,"utf8").trim();
 const endpoint=new URL(raw);
 if(!["http:","https:"].includes(endpoint.protocol) ||
    endpoint.username || endpoint.password) throw Error("invalid_endpoint");
 const ctrl=new AbortController();
 const timer=setTimeout(()=>ctrl.abort(),4500);
 try {
  const response=await fetch(endpoint,{method:"HEAD",redirect:"error",signal:ctrl.signal});
  process.stdout.write(response.status>=200 && response.status<500 ? "reachable" : "unverified");
 } finally {clearTimeout(timer);}
} catch { process.stdout.write("unverified"); }
' 2>/dev/null || echo unverified)"
case "$mcp_result" in reachable|unverified) ;; *) mcp_result=unverified ;; esac
printf 'HA_MCP_HTTP=%s\n' "$mcp_result"
echo "HA_WRITES=none"
