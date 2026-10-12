#!/usr/bin/env bash
# Owner runs this ONCE in canonical DEV. Never starts a bot or changes prod.
set -euo pipefail
repo="$HOME/projects/rs-home-ai-dev"
cd "$repo"
[[ "$(git branch --show-current)" == "feature/v3-home-agent" ]] || { echo "DENY: wrong checkout"; exit 1; }
[[ -z "$(git status --porcelain=v1)" ]] || { echo "DENY: local edits"; exit 1; }
install -d -m 700 "$HOME/.rs-home-ai-dev-test-tmp" "$HOME/.local/state/rs-home-ai-dev-automation" "$HOME/projects/rs-home-ai-v3-candidates" "$HOME/.config/systemd/user"
unit="$HOME/.config/systemd/user"
for kind in service timer; do
  target="$unit/rs-home-ai-dev-check.$kind"
  [[ ! -e "$target" ]] || { cmp -s "deploy/rs-home-ai-dev-check.$kind" "$target" || { [[ "$kind" == "service" ]] && git show 4669f84429774cc6b3cfd24e1e714149952aabf4:"deploy/rs-home-ai-dev-check.$kind" | cmp -s - "$target"; }; } || {
    echo "DENY: differing installed automation unit: $target"; exit 1;
  }
done
install -m 600 deploy/rs-home-ai-dev-check.service "$unit/rs-home-ai-dev-check.service"
install -m 600 deploy/rs-home-ai-dev-check.timer "$unit/rs-home-ai-dev-check.timer"
systemctl --user daemon-reload
systemctl --user enable --now rs-home-ai-dev-check.timer
echo "AUTOMATION_INSTALLED; dev validation only, NO production deployment"
systemctl --user list-timers rs-home-ai-dev-check.timer --no-pager
