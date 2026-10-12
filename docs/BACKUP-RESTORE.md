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

## 2026-10-08 — Sandbox SQLite backup prototype (implemented, not production-ready)

- `src/backup/fixture-sqlite.mjs` implements `backupFixtureSqlite` and `verifyFixtureBackup`, restricted to an explicitly supplied sandbox directory. It uses SQLite `.backup`, checks source/destination `PRAGMA integrity_check`, captures `user_version` and SHA-256/byte length in a manifest, and rejects overwrite, outside paths and symlinked sources.
- `test/fixture-backup.test.mjs` uses a disposable database and covers valid snapshot, checksum validation, corruption, duplicate destination, directory escape and symlink rejection.
- Focused test **1/1 passed**; full Raspberry Pi standard `npm test`: **45 files / 252 passed / 0 failed**, exit 0.
- No scheduled backups, encryption, off-device copy, private `.env` handling, live restore command, or production integration. This is an isolated proof of concept; do not use it as a production backup solution. Owner approval required before any real backup of private files or restore.
- Next: independent manifest validation, security hardening against directory replacement/races, schema compatibility tests and sandbox-only restore rehearsal; then separately design encryption, retention and off-device replication.

## 2026-10-08 — Sandbox-only SQLite restore rehearsal

- Added `restoreFixtureSqlite` in `src/backup/fixture-sqlite.mjs`. Before copying into a disposable sandbox destination, it requires a supported manifest schema version (`maxSchemaVersion`), matching SHA-256/byte length, SQLite integrity and exact sandbox containment. Existing targets (including symlinks) are rejected; restored copy is verified after copying.
- `test/fixture-backup.test.mjs` now covers isolated restore of a sample row, older schema ceiling, corrupt checksum, outside-sandbox destination and an existing file/symlink. Focused test **2/2 passed**.
- **Prototype security caveat:** filesystem path checks and creation are not a race-free sandbox; restoring adversarially controlled directories requires directory-descriptor/openat hardening. This is a test fixture only, not a production restore utility. Encryption, remote copies, private files, transactional multi-file restores and scheduled jobs remain unimplemented.


## 2026-10-08 — WAL consistency and failed backup cleanup: fixture gate complete

- The disposable SQLite fixture uses exclusive creation (`wx`) for the backup destination and removes its own incomplete output on failure. This prevents overwriting pre-existing files, including dangling symlinks, in ordinary single-process operation.
- A live WAL writer regression maintains an **uncommitted transaction** while `.backup` runs. The first snapshot includes only committed data. After committing the writer, a second verified snapshot includes the new row. This demonstrates snapshot consistency for this fixture, not general disaster recovery.
- A corrupted source fixture rejects the backup operation and the partial destination does not survive. The original source remains unchanged.
- Focused fixture tests **4/4 passed**; standard full `npm test` on Raspberry Pi: **45 files, 255 assertions passed, 0 failed**, exit 0.
- **Current substage complete:** sandbox-only snapshot, manifest/integrity validation, isolated restore, WAL writer and failure cleanup tests. **Production backup/restore remains NOT IMPLEMENTED.** Missing: race-free filesystem boundary enforcement, encrypted/off-device backup, recovery of private settings/secrets, retention/RPO/RTO, atomic multi-file restore, scheduled backups and operator-approved live restore.
- Next work returns to Gate B trusted authorization; backup productionization is a separately tracked milestone requiring owner approval.
