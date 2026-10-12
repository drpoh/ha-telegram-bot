# Archived standalone model experiments

The files in this directory were relocated here using `git mv` on 2026-10-11 to declutter the application root while retaining complete Git provenance and content.

They are historical, **manual-only** experiments, not part of `npm test`, the V2 entry (`src/index.mjs`) or the V3 pilot runtime. This is not a security review of their behavior. Do not run them without reviewing dependencies, credential use and external service effects. Paths relative to the original repository root may require adjustment before manual execution; no compatibility with historical shell aliases is implied.

- `list-models.mjs`
- `test-deepseek.mjs`
- `test-gemini.mjs`
- `test-lite.mjs`
- `test-openrouter.mjs`
- `test-openrouter-tools.mjs`

Intentionally NOT relocated: root `bot.mjs` (legacy monolith, potential external consumers) and root `smoke-auto-safe.mjs` (may actuate real lights). Old release directories, service checkouts, production credentials, runtime state and remote Git branches are untouched.
