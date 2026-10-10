# ADR — Future dev / stage / prod separation (2026-10-09)

Status: **approved as a future architectural requirement; NOT deployed**.

## Objective
Keep development, acceptance testing, and production operationally isolated. Home Assistant Green must continue operating normally when any AI service fails. Existing v2 production and the narrowly scoped v3 pilot stay untouched until a separately authorized migration.

| Boundary | dev | stage | prod |
|---|---|---|---|
| HA data | Offline fixtures/sanitized snapshots | Mock HA or dedicated HA test instance; default no real HA | Approved live HA-MCP with existing policy |
| Writes | Never | Never by default; any later controlled hardware tests need separate isolated approval and scope | Only explicitly reviewed entity/service, confirmation, preconditions, verification |
| Telegram | No production bot token | Separate test bot/chat | Existing approved bot/chat |
| Storage | Disposable unique database and replay store | Isolated durable test database/replay store | Dedicated protected production storage |
| Secrets | Fake only | Independent secrets | Production secrets unavailable to dev/stage |
| Services | Distinct process/unit names; never share polling token | Distinct process/unit names; never share polling token | Existing production units remain independent |
| Logging | Redacted test events | Sanitized acceptance evidence | Restricted retention, incident journal |

## Release discipline
Promote immutable reviewed commit/artifact **dev → stage → prod**, never promote stateful SQLite files or secrets. Syntax + unit + isolated integration tests in dev; negative tests, restart and rollback drills with fixtures in stage; explicit owner sign-off, backup, rollout window and rollback in prod. No implicit environment promotion from AI-generated text or environment variables provided by a user request.

## Safety and migration gates
- Environment is assigned by an operator-owned deployment configuration and enforced by the trusted tool executor, NOT by a model argument or plain inbound payload.
- The current `src/ops/environment-boundary.mjs` is a **pure offline policy prototype**, not enforced by the running v2 or v3 service. Its `realHa` and `approvedProdDeployment` booleans must be derived from trusted deployment evidence in a later implementation, never blindly supplied by the caller.
- Before deploying stage, create isolated credentials, service names, ports, bot token, chat, database, logs, and mock HA endpoint; test that cross-environment access and token sharing fail.
- Before prod promotion, complete Gate B authorization and Gate C fault handling for proposed scope; retain one-device v3 pilot limit until explicit expansion. Gate E requires trusted Assist transport and owner-reviewed confirmation. No service restart or HA actuation is authorized by this ADR.
- Any new real-world hardware stage must be a separately designated test HA instance and approved devices; do not treat the family's HA Green as a stage playground.

## Decision
Keep the existing v2 production and current v3 pilot as-is. Build the shared application with an explicit deployment-environment adapter and distinct operator-controlled configurations in a future rollout. Avoid immediately splitting Git into three long-lived branches; immutable promotion and environment-specific deployment config should precede branch strategy changes.

## Offline isolation manifest checks — 2026-10-09
- `src/ops/environment-isolation.mjs` validates three separately operator-supplied redacted deployment descriptors: service identifier, private storage path, listener port, Telegram credential reference and HA endpoint reference must all differ between dev, stage and prod.
- `dev` must declare fixture-only HA access, `stage` mock HA access; both must explicitly disable HA writes. `prod` declares approved-live intent but that alone confers **no execution rights**. This is a validation prototype, not runtime service wiring or a security boundary against a privileged host operator.
- Eight focused checks across environment policy and isolation passed. No actual tokens or credentials are put in manifests. No real environment has been deployed or migrated.

## Offline storage containment hardening — 2026-10-09
- Environment descriptors now reject nonabsolute, non-normalized, root and nested storage directories. Merely differing path strings is insufficient: e.g. `/isolated/dev` and `/isolated/dev/stage` must not coexist as separate environments.
- 9/9 focused boundary and isolation tests passed. This is lexical containment validation only: symlinks, actual filesystem ownership, mount points and runtime service permissions still require separate verification before deploying stage or prod.

## Live Pi read-only unit inventory — 2026-10-09
- Inspected systemd, without editing units: system-level `ha-telegram-bot.service` was active. User-level `rs-home-ai-v3.service` and `desktop-commander-remote.service` were active. The user timers `rs-gate-d-health.timer` and `rs-gate-d-alerts.timer` were present and scheduled.
- This is not proof of three environments. Neither a distinct dev nor stage Home AI service is deployed. The existing system bot and v3 narrow pilot must stay untouched while environment manifests and credentials are developed offline.
- Before creating stage, audit installed unit `EnvironmentFile`, `WorkingDirectory`, `ExecStart`, identity, credentials and port allocations with redacted outputs, provide a mock HA source and separate Telegram credentials, test strict isolation and rollback, then request owner approval for any changes to running services.
- Focused environment tests after nested storage hardening: 9/9 passed; full regression was launched separately, result pending at writing time.

## 2026-10-10 checkout ownership update
- Read `PI-REPOSITORY-LAYOUT-PLAN.md`: the v2 system unit runs from `/home/drpoh/ha-telegram-bot`, while V3 pilot user unit runs from `/home/drpoh/rs-home-ai-v3`; both are separate checkouts of the same remote with different HEADs. Neither is a disposable dev environment. No changes to live units until separately authorized.
