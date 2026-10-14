# RS Home AI V3 — короткий handoff

> **2026-10-14 owner-area rename fixture:** Pure mock integration now exercises `area_registry_updated` → stale → full snapshot refresh → old area answer absent / new Russian area answer present. CI/live Pi proof separate. GitHub source-only; no live zone edits, credentials, new poller or prod change.

> **2026-10-14 source-only reconnect race fix:** Observer previously queued a retry after an in-flight read failed with `concurrent_change` even if connection had disconnected. New connected gate suppresses timers and events offline, `ready` triggers revalidation; mock regression added. Next GitHub CI then Pi read-only live proof. No new poller or production deployment.

> **Markdown audit result (2026-10-14):** GitHub CI run 38575866492 scanned 87 git-tracked Markdown files, 181 local links and reported exactly two broken paths in `docs/archive/TODO-history-through-2026-10-11.md`. Both targets were corrected with `../` in the PR branch; final CI still required before merge. Legacy content otherwise untouched. Pi access and live catalog event delivery remain unverified.

> **2026-10-14 docs audit:** DEV-only Markdown audit extends CI from 16 active documents to all tracked Markdown; historical findings are reported, not auto-rewritten. Review CI totals before declaring full coverage. Catalog event delivery and reconnect remain separate open work; production unchanged.

> **CURRENT HANDOFF — 2026-10-14 (supersedes older entries):** GitHub DEV `feature/v3-home-agent` contains squashed PR #179 at `7cfd96d0b63a4ba49ad5afb2cc6271699986334b`. Exact PR CI [38573071467](https://github.com/drpoh/ha-telegram-bot/actions/runs/38573071467) PASSED: Node 20.20.2/x64; syntax 451/451; isolated 242 test files / 897 assertions / zero failures; documentation link check 16 files / 142 links. New pure `src/home/ha-catalog-questions.mjs` answers selected metadata questions from verified fresh snapshots; **not connected to Telegram**. Real HA five-list snapshot and five subscribe ACKs are owner-proven, **not actual change-event delivery**. Raspberry Pi remote command access is quota-blocked; verify canonical Pi DEV worktree/HEAD before local synchronization. **Next single vertical slice:** owner-initiated HA zone change -> event delivery -> stale -> full five-list refresh -> renamed-zone question, with disconnect/reconnect fault acceptance; then reviewed Telegram read-only integration and owner-gated release. Do not start a second poller, touch credentials, change HA zones, systemd or pinned prod `93f11cd`/V2. Previous 'feature PR pending CI' handoff immediately below is historical.


> **2026-10-14 current work:** GitHub feature branch `feat/v3-catalog-room-answers-20261014` carries pure, non-deployed registry catalog Russian questions and normalization of area/floor/device names. No live Pi access via Desktop Commander (monthly remote-tool limit); do not label GitHub CI as ARMv7/live HA acceptance. Next: finish PR CI, then read-only Pi test and owner-driven actual event proof, followed by Telegram wiring after separate gate. Never touch pinned production `93f11cd` or V2.


> **2026-10-14 operator next:** One-shot bounded native WebSocket subscription probe checks `floor_registry_updated`, `area_registry_updated`, `device_registry_updated`, `entity_registry_updated`, `label_registry_updated` using existing LAN/token env; offline preflight default, explicit `--read-only` only, no raw payload logs/HA writes. Run from clean canonical Pi DEV after CI merge. A subscription ACK does NOT validate actual change events. Production V3 `93f11cd` and V2 unchanged.


> **2026-10-14:** Source-only `ha-ws-catalog-session.mjs` now composes loader + freshness coordinator + five-event observer. End-to-end fake WebSocket tests check ordering, read-list-only traffic, area-update debounce and reconnect. No live connection; preserve production `93f11cd` and V2. Next: prove real HA event subscriptions and review failure/ready race under live Pi DEV credentials before any stage or production activation.


> **2026-10-14 registry events:** DEV pure injected `ha-ws-registry-event-observer.mjs` now uses documented HA JS `subscribeEvents(cb,type)` promise-unsubscribe and connection `ready`/`disconnected`/`reconnect-error` listeners. Five subscriptions, debounced full five-list reload, stale guard if zones change during fetch, unsubscribe on stop. Offline fake tests; not activated against HA or production. Next: verify actual bus event availability and integrate an owner-reviewed DEV-only read-only adapter, without keeping any token in GitHub/chat. Existing production pinned `93f11cd`.


> **2026-10-14 owner decision:** Native HA WebSocket full registry snapshot must track future changes to zones and metadata. AGENTS.md now records this permanent design. Pure DEV refresh coordinator invalidates on registry events/disconnect and rejects in-flight reads invalidated by changes. Not yet connected to live HA events; V3 production pinned `93f11cd`, V2 unchanged.

> **OWNER-CONFIRMED HA WS SUCCESS 2026-10-14:** `HA_WS_READ=validated_snapshot`; counts floors=2, areas=17, devices=294, entities=2881, labels=15, unassignedEntities=1987, unassignedDevices=194, disabledEntities=1339, hiddenEntities=7. Test was 5 max registry reads with 0 writes, no prod changes, token not provided in chat or persisted by tool. Note 100 area-assigned devices matches earlier per-area MCP census but does not measure distinct physical devices. Added DEV pure aggregate report module `src/home/ha-registry-coverage-summary.mjs` (only verified five-registry source, permission-independent). Next: integrate event-based update and privacy-safe scope summaries; do not ask for another token or raw catalog file. Preserve live V3 `93f11cd` and V2.


> **2026-10-14 DEV WebSocket transport:** One-shot `src/home/ha-ws-once-reader.mjs` has injected WebSocket transport and fake-auth/message regression; `scripts/manual/v3-ha-ws-registry-once.mjs --preflight` requires no env, no secrets, no network and reports Node WebSocket availability. Explicit `--read-only` separately requires owner-configured `HA_CATALOG_WS_URL` and `HA_CATALOG_TOKEN`; never ask owner to paste token in chat or hardcode token. No live connection or production action has occurred. Maintain pinned V3 `93f11cd`.


> **Latest handoff 2026-10-14:** DEV added pure WebSocket five-registry loader (`src/home/ha-ws-registry-loader.mjs`) that accepts an injected already-authenticated `sendMessagePromise` interface, calls only five native list operations and validates full response payload arrays; partial/error/timeout -> unverified. Pure freshness tracker invalidates after registry changes/disconnect. No actual HA WS access granted, no credential creation, no runtime connection or promotion. Next: verify HA Core version-specific WebSocket listing permissions and selected sanitized shapes under a specifically approved owner-run probe; confirm child devices and benchmark Pi3. Preserve `93f11cd` production.


> **2026-10-14 latest:** Source research saved; official Home Assistant WebSocket API and home-assistant-js-websocket sendMessagePromise/CreateLongLivedTokenAuth were checked. New DEV pure fixture-only five-registry join module `src/home/ha-ws-registry-snapshot.mjs` requires complete successful floor/area/device/entity/label lists, flags partial/unknown links, does not grant HA read/write permissions. Do NOT use Perplexity's unverified sample client directly or create token automatically. Next: test actual HA instance registry list permissions through approved minimal read-only access, then consider event-driven refresh. Production `93f11cd` unchanged.


> **2026-10-14 live findings:** 17/17 HA areas, 100 area-assigned device records (17 calls), and 15 labels verified; `entity_entry` supports `area`, `device_id`, `label_names`. PR #167 DEV-only native category adapter merged `2fa25e7`; never infer full registry or physical authorization. Next operator test: `scripts/manual/v3-ha-entity-domain-proof.mjs`, a single schema-gated `ha_get_entity({domain:'light'})` call that logs only sanitized response shape. Source-only until full CI and owner Pi output. Production `93f11cd` unchanged.


> **2026-10-14 latest handoff:** Owner HA-MCP floor-area response verified 17 areas (two floors 5+7 plus five unassigned), zero orphaned. DEV PR #160 merged `23cd630`, source-only bounded joins for native areas + independently validated partial entity/device/label data. CI #38546737652 PASS 417 syntax / 225 isolated files / 833 assertions. New operator-only schema tool `scripts/manual/v3-ha-mcp-argument-shapes.mjs` uses `listTools` ONLY and prints constrained complex input argument shapes; it does not call HA tools. No live entity/device registry snapshot yet. Production V3 `93f11cd` unchanged, do not promote broad DEV. Next: operator manifest evidence, then select limited read-only metadata calls with reviewed schemas.


> **LATEST HANDOFF 2026-10-14:** Production V3 owner-confirmed pinned `93f11cd`, one V3 process, V2 unchanged, rollback `f744557`, live Telegram kitchen -> corridor -> tambour conversational QA PASS; source 447/447 verified. Bulk DEV-only PR #152 merged as `6b9ba5b` into `feature/v3-home-agent`: 19 previously reviewed/unverified candidate lights grouped by living/bedroom/bathroom/kitchen-extra/hallway-extra, two exact sensor reads (dishwasher power, bathroom switch battery), Russian questions and room followups; no physical light permissions. GitHub CI #38538434803 syntax 399, 216 isolated files/806 assertions PASS. DEV broad diff not deployable directly: prepare pinned candidate atop `93f11cd`, validate exact read boundary, stage on Pi, secure operator authorization. Prior production f744557 below historical.


> **LATEST live 2026-10-14:** production V3=`f744557d394d38418e9e47ecbc61184a461a40d4` (PID 6783 observed at start, one process, V2 unchanged, rollback to 2fbee8f). Real Telegram on current release: corridor 0 on/3 off/0 unknown; kitchen 1 on (`light.kukhnia_led_niz_l1`)/3 off/0 unknown; sauna 27.5625°C, threshold 85°C. Raspberry Pi3 Node20 syntax 337/337, 177 isolated test files/676 assertions PASS, source integrity 445/445. Compact S/T progress included. Gate D live read-only acceptance PASS. No additional light write permission or physical identity verification. Next: reuse existing DEV `src/pilot/v3-readonly-followup-router.mjs` for minimal pinned-production followup release without whole DEV or second Telegram poller; build, stage, review, separately approve. Natural reboot persistence and `/cancel` smoke test remain separate reliability checks.


> **LATEST HANDOFF 2026-10-14: owner confirms V3 production SHA 2fbee8f on Raspberry Pi3 ARMv7 Node20.19.2 via 99-kitchen-release.conf, DEPLOYMENT=PASS, PID 25870 observed, one V3 process, V2 unchanged. Live Telegram kitchen query now reports 0 ON / 4 OFF / 0 UNKNOWN instead of four read errors; sauna returned 27.875 C. Hotfix source in PR #142 limits extra permissions exclusively to ha_get_state for four reviewed kitchen IDs, no kitchen writes. Pi full offline test suite 176 files / 673 assertions PASS and release 441/441 tracked sources PASS. e902efeb is immediate rollback and 9dd5964/c6a9812 remain preserved. Still need live overview and /cancel on this newest PID; no forced reboot. DO NOT regard historical production 9dd5964 claims below as current. User wants more source-only autonomous work and fewer interactions; next vertical slice read-only conversation context, reuse DEV router and MCP, never deploy whole DEV blindly.**

> **Перед продолжением обязательно прочитайте [CURRENT-STATE](../CURRENT-STATE.md).** Там находится актуальный статус; здесь только точка продолжения работы. Старый [CHAT-HANDOFF](../CHAT-HANDOFF.md) сохранён как история.

## Цель

Практический русскоязычный домашний ассистент: Telegram, HA Assist, M5Stack/ESPHome; естественная речь, контекст и память; безопасное управление через HA-MCP. **Reuse First:** systemd, HA-MCP, Home Assistant Assist, ESPHome и готовые библиотеки вместо своей инфраструктуры.

## Где работать

- Репозиторий: `drpoh/ha-telegram-bot`.
- **Изменяемый исходный код:** ветка `feature/v3-home-agent`, Raspberry Pi `/home/drpoh/projects/rs-home-ai-dev`.
- **Не менять автоматически:** `/home/drpoh/ha-telegram-bot` (V2 runtime), `/home/drpoh/rs-home-ai-v3` (Gate D), immutable V3 production, HA Green, токены, systemd live unit.
- GitHub main — отдельная базовая ветка, **не** DEV-релиз. Для отдельного изменения работать в PR → CI → merge в DEV; Pi синхронизировать только через чистый worktree + `ff-only`.
- Docker необязателен; один Telegram poller; STAGE — offline/mock без доступа к HA writes.

## Подтверждение и ограничения

- Последние **подтверждённые пользователем** результаты Pi и реального HA-MCP см. в [CURRENT-STATE](../CURRENT-STATE.md), не переписывать здесь числа и состояния.
- Новые `light.*` только read-only до точной физической идентификации, отдельного допуска и release gate. `light.browser_mod*` исключены. `unavailable` ≠ `off`.
- Read-only `ExecStart` V3 проверен: **active** `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; V2 system service **active**. Побайтовая проверка active `9dd5964` **437/437 tracked source+exec PASS**, owner Telegram `/status`, `/sauna` и 3 русских read-only запроса тоже PASS; **реальный rollback и token-level polling uniqueness не проверены**.
- Ручная отправка диагностики из Pi в private `drpoh/rs-home-ai-private-reports#1` уже сработала. GitHub connector ChatGPT не имеет чтения private repo; токены не выводить/не копировать.
- Никогда не смешивать source tests, Pi offline mock, live HA read, Telegram live write и физическую проверку: разные уровни доказательства.

## Непосредственный следующий шаг

1. **Owner live Telegram acceptance, 2026-10-13:** pinned V3 `9dd5964`, уже работающий private `RSHomeAI_v3_bot`. `/status` сообщил доступный защищённый журнал; `/confirm` без ожидающего запроса ответил «Нет действующего запроса для подтверждения»; `/sauna` → **88.625 °C**, готова, порог 85 °C. Следом **три естественных вопроса** Telegram: «Сколько градусов в сауне?» → **89 °C / готова**, «Где горит свет?» → **0 ON/4 OFF/0 UNKNOWN среди 4 выбранных ID**, «Горит ли свет в тамбуре?» → **off**. Это живая read-only цепочка Telegram → pinned V3 → HA-MCP, не полный свет в доме.
2. **Предыдущие Pi gates:** DEV `npm test` 391 syntax files, 212 test files/785 assertions/0 failures, прогресс в одной строке; pinned `9dd5964` source 437/437 Git bytes + executable bits PASS; local V2/V3 active & known entrypoints distinct, 1+1 (нет локальных дубликатов). Три release директории (`9dd5964`, `c6a9812`, `97343fa`) прошли статический `npm ls --offline`; legacy `97343fa` 3/3 выбранных Git blobs совпадают. `RELEASE_COMMIT` отсутствует лишь у исторической сборки.
3. **Текущий минимальный кандидат PR #134, 2026-10-14:** GitHub head `e902efeb923a2090ca0d188e92d1ccdc28d1627e` на неизменённой `9dd5964` базе. Diff 7 файлов (6 исходных read-only + 1 тест). Параллельный **verification-only** [PR #139](https://github.com/drpoh/ha-telegram-bot/pull/139) закрыт **без merge** после независимого literal candidate checkout и GitHub Actions [run #38503518196](https://github.com/drpoh/ha-telegram-bot/actions/runs/38503518196) **SUCCESS**: Node 20.20.2, 4/4 focused, **176 isolated files / 672 assertions / 0 failures**. Побайтово старый Telegram entrypoint не изменён (кроме двух read-only строк). Source-only `RELEASE_COMMIT`/SHA256SUMS artifact `11867150164`, ZIP digest `sha256:baca7ab088b90de426bd9e962feb9e2ea48716c4be801e54fc06845894de03cf`, истекает 2026-10-28. CI является **отдельным workflow и не отображается как проверка PR #134**, Pi ARMv7 / Telegram / recovery не пройдены. Следующий шаг — Pi offline worktree exact SHA, Gate D install/rollback/one-poller preflight; **никакого systemd switch без владельца**.
4. **Не закрывать Gate D целиком:** functional rollback не испытывался, token-level Telegram poller uniqueness на иных хостах не доказана, installed dependency bytes не аттестованы. Gate B по физической идентичности `light.kukhnia_svet` всё ещё OPEN; HA Green, V2/V3 production и systemd не изменять в ходе DEV документирования.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.

## Историческое дополнение 2026-10-13 — до нового CI для PR #134

GitHub DEV HEAD подтверждён `c0dd10048d3d64ad7ef1b7b0d5c16406c9c351a1`. PR #134 по-прежнему открыт, `head=cdcfdcdaeeec408fa89001e578639b9144b1a7e1`, `base=9dd5964a4956b88227ec4002ac80ef46a186d632`, GitHub compare ровно 6 файлов / 186 добавлений / 0 удалений, существующий consent/actor/launch unchanged in source diff. Workflow runs/statuses для candidate HEAD **0/0**, CI не запускался. Pi online, но Desktop Commander monthly quota не позволяет выполнить команды; Pi tests не проводились. Подробная независимая рецензия — комментарий к [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134). Следующий шаг: offline Pi isolated worktree на точном candidate SHA, Node 20 checks, consent regression, затем exact-SHA CI и Gate D release planning. Не merge и не deploy без подтверждений.

## Handoff дополнение — внешний Deep Research, проверен 2026-10-13

Отчёт Perplexity `export_7780787100989724748.md` принят как **список гипотез**, а не подтверждение текущей реализации: сам Perplexity репозиторий не прочитал. GitHub DEV `c0dd10048d3d64ad7ef1b7b0d5c16406c9c351a1` уже содержит SQLite conversation, context builder, entity/area resolver, strict-area resolver, policy, durable confirmations/journal, read-only router. Приоритет **не меняется**: сначала exact-SHA PR #134 offline CI/Pi + Gate D, затем безопасный read-only контекст «А в коридоре?» через existing code; не создавать новый framework или DB. `conversation.process` способен выполнять физические действия; strict policy обязателен. Для details см. новые записи CURRENT-STATE/TODO/WORKLOG. Production и HA не менялись.

## DEV контекстная функция (PR #137, 2026-10-13)

Реализован in-memory exact-scope read-only follow-up: «Что со светом на кухне?» → «А в коридоре?» (ровно 3 уже существующих обзорных ID), «А на кухне?», «А в тамбуре?». Внешний test PR source HEAD `6d39916818a575c0f113d6d340076d659dfae042` прошёл GitHub offline Node20 CI **395 syntax / 214 files / 794 assertions / 0 failures**; подтверждена только offline DEV реализация. **PR #137 merged → DEV SHA `4d79c8795ce6a105b32afcd17bea10dd1a72c58b`; финальный PR head `71054ed3497bb7ba00ced240d44884fe92510ec6` GitHub CI PASS: 395 syntax / 214 test files / 796 assertions / 0 failures.** Pi/runtime не изменены. Это дополнительный полезный DEV этап, но приоритет release остаётся у отдельного [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134): без его exact-SHA Pi/CI/rollback Gate D он не готов к переключению.
