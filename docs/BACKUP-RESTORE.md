# Backup and Restore

GitHub backs up code and documentation, not secrets or private runtime memory.

## Back up privately
- .env / credentials
- runtime SQLite databases
- learned memory/state that is not reproducible
- service configuration when host-specific

Do not commit these files.

## Restore order
1. Install the application from GitHub at a compatible version.
2. Run tests.
3. Restore secrets.
4. Restore compatible runtime database/state.
5. Verify HA-MCP.
6. Start in non-autonomous/safe mode.
7. Perform acceptance tests.
8. Re-enable explicitly approved autonomous policy.

A future backup command should produce a versioned manifest so database/schema compatibility can be checked before restore.


## Recovery objectives and boundaries — design, not an implemented backup service

**Separate assets:**
1. **GitHub:** versioned source code and docs, without live state or secrets.
2. **Raspberry Pi application:** private `.env`/API keys, `data/bot.db` and other persistent state, reviewed local lighting classification, systemd/service settings. Include any required dependency versions and migration notes.
3. **Home Assistant Green:** its own encrypted backup/export process under Home Assistant settings. Never assume backing up this repository backs up HA.

**Planned backup workflow (P1 after Gate B safety):**
- Run backups outside Git and outside public repository storage, with restrictive filesystem permissions and an encrypted off-device copy.
- Take a consistent SQLite snapshot using the SQLite online **backup API** or `sqlite3 .backup`, never a naïve copy of a live WAL database. Read-only integrity checks follow the snapshot.
- Produce timestamped versioned manifest: application commit, schema version, creation time, included file categories, archive hash SHA-256, encrypted status, restore compatibility and redacted inventory. Never log archive secrets.
- Check available space, cap retention by count/age and document failure/partial-backup behavior. No automatic cleanup of unverified backups.
- Schedule and monitor only after backup + restore tests demonstrate correctness. Remote storage and credentials require owner approval.

**Planned restore workflow (requires explicit owner approval for any live target):**
1. Verify signature/checksum, encryption and schema compatibility. Reject unknown/newer formats.
2. Restore **only to a disposable sandbox** first; compare expected records and exercise tests.
3. Back up the current destination, stop writes safely, restore with documented rollback and owner-approved maintenance window.
4. Validate integrity, MCP read-only health, service status and key invariants, then deliberately re-enable restricted capabilities. Never automatically re-enable autonomous device actions.
5. Document recovery outcome and keep prior backup until validation completes.

**Acceptance criteria:** restore succeeds in an isolated directory; DB integrity check is `ok`; no secrets in Git/logs; negative tests reject corrupt archives/path traversal/wrong schema; backup/restore routines are idempotent where possible; runbook can recover after losing the Pi while Home Assistant Green remains untouched. Set RPO/RTO with the owner before activation.

**Safety boundary:** this document introduces no backup job, no filesystem restore, no production service interruption and no HA actuation. Restoration into the live bot or HA requires separate explicit confirmation.
