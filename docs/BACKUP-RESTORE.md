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
