# GitHub-first offline development review (2026-10-11)

Status: **proposal only**. This branch does not deploy or modify any Raspberry Pi runtime.

## Working agreement

- `feature/v3-home-agent` remains the canonical development integration branch. Raspberry Pi checkout: `/home/drpoh/projects/rs-home-ai-dev`.
- For ChatGPT/Codex work while Remote Desktop Commander is unavailable, open a **short-lived PR branch** in GitHub; do not commit directly to `feature/v3-home-agent` before review.
- Use repository files for the implementation and unit tests. This new workflow runs only offline, ephemeral GitHub-hosted Node 20/Linux tests with fixture tokens and a loopback dummy MCP endpoint. It does **not** read secrets or call Home Assistant.
- No self-hosted runner on the home Raspberry Pi; no `pull_request_target`, deployment action, environment secrets or auto-merge.
- A GitHub green check is only preflight evidence. For changes intended to be released, run compatibility/full tests against the canonical Pi dev checkout and record actual exit status before an authorized promotion.
- Never modify or pull the existing `/home/drpoh/ha-telegram-bot` V2 runtime or `/home/drpoh/rs-home-ai-v3` preserved V3 checkout. Active pinned V3 release is separately operated. Do not expand HA scopes or restart services.
- Merge of this CI proposal requires review of the workflow permissions and its first GitHub Actions execution. GH PR check results must be checked explicitly, not assumed.
- Stage/prod continue to require owner-approved isolated deployment and verified rollback. GitHub Actions does not constitute trusted HA identity, authoritative registry provenance, or Gate B signoff.

## Known limitations

- Ubuntu runner passing does not prove ARMv7/Raspberry Pi compatibility.
- Fixtures mock HA and credentials; they do not exercise authenticated production MCP.
- `npm ci --ignore-scripts` keeps install lifecycle scripts disabled for this review CI. If a future dependency needs one, evaluate it rather than weakening CI globally.
- A workflow on a PR branch is not evidence that the workflow itself was approved or successfully executed.
