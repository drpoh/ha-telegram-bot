# Decision dependency graph audit — 2026-10-11

Scope: canonical dev checkout only, read-only inspection of `.mjs` source/test/script relative static imports. No production module or runtime was changed. Source version before audit: `03d2e97`.

## Observed inventory
- 317 `.mjs` files scanned across `src`, `test`, `scripts`, with 415 matched relative import edges; zero unresolved matched relative imports.
- `src/decision`: **77 modules**. All 77 have at least one static incoming reference within the scanned corpus; **76 are imported directly from tests**. The only one without a direct test import is `src/decision/types.mjs`, still transitively reachable from V2. **Zero established safe deletion candidates**.
- Traversal from `src/index.mjs` (V2 source entry) reaches **16** decision modules. Traversal from `src/pilot/telegram-readonly.mjs` (V3 source entry) reaches **5** decision modules. These source reachability graphs are NOT a statement about what's currently loaded in independently pinned release artifacts.
- Highest inbound static reference counts: `v3-intent-ledger.mjs` (13), `v3-gate-c-execution-journal.mjs` (13), `pending-confirmation.mjs` (10), `v3-isolated-joined-chain.mjs` (10), `confirmed-result-verification.mjs` (8), `v3-tool-boundary.mjs` (8). They are actively reused interfaces, not cleanup candidates.

## Limits of evidence
The scan matches relative `.mjs` imports, including `import()` with a literal. It is not a complete dependency graph for computed dynamic imports, non-module references, external process invocations, runtime configuration, or service entrypoints. Test imports alone prove that code is tested, **not** that it is needed by current production. Conversely a module used only in tests may be retained reference behavior or safety regression evidence; do not delete it on reachability alone.

## Decision
1. **No deletion or physical restructure of `src/decision`** at this checkpoint; 77 apparently referenced modules and multiple trust boundaries make a mass move high-risk with no proven benefit.
2. Preserve current top-level folder and adopt logical grouping from `STRUCTURE-INDEX.md` for all new changes. Incrementally consolidate only behavior proven equivalent by trust/provenance, confirmation and replay tests.
3. Future cleanup must first inspect test-only leaves, dynamic invocation and Git/service/cron consumers. A reviewed limited move must update all imports, test fixtures, docs and produce full Pi regression, with no live deployment.
4. Avoid adding a new persistent dependency-index service or bundler; a one-time built-in Node static inspection suffices for this decision.

**Status:** graph analysis completed; physical restructuring deliberately not approved or necessary now. Priority returns to offline decision-policy development and existing production promotion gates.
