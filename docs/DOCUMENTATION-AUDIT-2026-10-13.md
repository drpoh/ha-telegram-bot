# Documentation audit — 2026-10-13

Scope: the **71 tracked `.md` files** in GitHub `feature/v3-home-agent` at audit start. This is a path inventory and targeted content/consistency audit of primary entrypoints, not a claim of manually validating every historical statement or each file link. No files removed, moved, or rewritten wholesale.

## Findings and disposition

1. **Stale top-of-file checkpoints.** `CURRENT-STATE.md` (dated Oct 12), `CHAT-HANDOFF.md`, `TODO.md`, `PROJECT-MAP.md`, and `README.md` did not consistently reflect the Oct 13 verified Pi DEV and HA readouts. Updated their current-entry context; preserved dated evidence.
2. **Contradictory historical runtime release labels.** Some Oct 12 material calls `c6a9812` active; another calls `9dd5964` active. The present conversation **does not independently establish the live systemd ExecStart**. Do not resolve this by guessing: live production remains read-only and must be inspected separately.
3. **Light availability is not physical identity.** On Oct 13, the operator's fixed 19-candidate read yielded **2 ON, 7 OFF, 10 unavailable**, with `NEW_LIGHT_REVIEW=partial`. Nine are readable, **zero additional physical circuits independently identified or authorized for actuation**. Historical Oct 12 snapshots remain dated; no old state is a live cache.
4. **Test and HA-MCP evidence differ.** Owner-confirmed DEV `6f6e694`, Node 22.23.3, 198 isolated files / 726 assertions / 0 failed files, clean Git; subsequent read-only Pi HA-MCP preflight passed sauna, four exact lights and tambo(u)r. These do **not** prove production promotion or full Gate B/voice acceptance.
5. **New private operational telemetry.** Outbound manual HTTPS GitHub Issue report successfully sent by Pi into private `drpoh/rs-home-ai-private-reports` Issue #1, comment #6141220575, following shared `main` PR #102 parser fix. The ChatGPT GitHub connection cannot independently read that private repository (404). No scheduled sender, production credential migration, public report, or authorized HA write.
6. **Navigation ambiguity.** Several numbered ADRs, acceptance snapshots, reviews and checklists are historical; only dated append and prominent pointers were updated. Historical references to PRs and versions are retained as historical evidence rather than silently rewritten.
7. **Historical Tor SSH diagnostics.** GitHub runner inbound Tor diagnostics failed; manual outbound HTTPS is the accepted path. Do not remove credentials, keys, workflow or existing Termux SSH without an independent, reviewed cleanup step.

## Canonical reading order

`AGENTS.md` → `docs/CURRENT-STATE.md` → `docs/PROJECT-MAP.md` → `docs/TODO.md` → `docs/CHAT-HANDOFF.md` → `docs/WORKLOG.md` → topic-specific ADR / review.

`docs/archive/` and dated `docs/V3-*-2026-10-*.md` are immutable historical evidence unless a correction is explicitly appended. Docs commits only update the GitHub DEV branch: Pi DEV needs a separately verified clean-worktree fast-forward; production must **not** be deployed just to adopt documentation.

## Pending independently verifiable work

- Confirm live Pi `systemctl --user show rs-home-ai-v3.service -p ExecStart` and system V2 service read-only if runtime provenance is required.
- Obtain authorized read access for the ChatGPT GitHub connection to the private reporting repository, or rely on sanitized owner-provided excerpts.
- Review HA entity device/area and physical fixture matching for `light.kukhnia_svet` and remaining eight responsive candidate IDs. No physical commands without separate approved release gate.
- In a subsequent automated link-check change, scan all Markdown relative links against the full Git tree. This pass did **not** run such a checker.
