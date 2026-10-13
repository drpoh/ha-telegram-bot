# Gate D — служба, перезапуск и восстановление

**Текущий статус — только в [CURRENT-STATE](../CURRENT-STATE.md#3-gates).** Исторические отчёты не подтверждают сегодняшнюю привязку `ExecStart`.

## Критерии

1. Только read-only подтвердить фактические `ExecStart`, состояние и закреплённые SHA V3/V2; не угадывать между `c6a9812` и `9dd5964`.
2. Проверить различие между DEV, offline STAGE, historical Gate D checkout и immutable production.
3. Проверить перезапуск по systemd, сохранение единственного Telegram poller, независимость HA Green и V2, доступность rollback.
4. Контролировать целостность артефактов/конфигурации, восстановление после сбоя, уведомления и доступность логов без чувствительных данных.
5. Повторный живой тест только по явному отдельному плану с восстановлением; наличие прошлых reboot/SIGKILL логов не освобождает от свежего evidence.

## Безопасная read-only проверка

```sh
systemctl --user show rs-home-ai-v3.service -p LoadState -p ActiveState -p ExecStart
systemctl is-active ha-telegram-bot.service
systemctl --user is-active rs-home-ai-v3.service
```

**Свидетельство 2026-10-13:** оператор подтвердил `ActiveState=active`; `ExecStart` V3 указывает на `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; `ha-telegram-bot.service` → `active`. Это доказывает исполняемый путь/состояние systemd при проверке, **не** проверяет Git SHA файлов, единичность poller, API и восстановление. Итоговый Gate D остаётся частичным.

Никаких `restart`, `enable`, изменения unit или `git pull` в runtime по результатам этого документа.

## Следующий операционный шаг: проверка источника pinned release только чтением

Реальный live HA-MCP preflight четырёх естественных вопросов пройден на **Pi DEV** 2026-10-13 (`TELEGRAM_QUESTIONS_READONLY=PASS`; `npm test` 209/766/0). Это **не** доказывает, что этот код работает в Telegram production. Перед любым release/prod-изменением оператор вручную проверяет:

```bash
# Запуск от обычного пользователя drpoh; не меняет systemd, файлы и HA.
systemctl --user show rs-home-ai-v3.service \
  -p ActiveState -p MainPID -p ExecStart --no-pager
systemctl show ha-telegram-bot.service \
  -p ActiveState -p MainPID -p ExecStart --no-pager

dev=/home/drpoh/projects/rs-home-ai-dev
release=/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964

if [ -d "$release" ] && [ ! -L "$release" ] &&
   [ -f "$release/RELEASE_COMMIT" ]; then
  declared="$(head -n 1 "$release/RELEASE_COMMIT")"
  if [[ "$declared" =~ ^[0-9a-f]{40}$ ]] &&
     git -C "$dev" cat-file -e "$declared^{commit}" 2>/dev/null; then
    echo "RELEASE_DECLARED_COMMIT=$declared"
    # Do not use tar --compare as an integrity gate here: it also tests
    # uid/gid/mode/mtime and can reject unchanged Git source bytes.
    # The separate reviewed Node verifier below hashes exact Git blobs.
  else
    echo "RELEASE_DECLARED_COMMIT=UNVERIFIED"
  fi
else
  echo "RELEASE_PATH_OR_MARKER=UNVERIFIED"
fi

for old in \
  /home/drpoh/projects/rs-home-ai-v3-release-c6a9812 \
  /home/drpoh/projects/rs-home-ai-v3-release-97343fa; do
  if [ -d "$old" ] && [ ! -L "$old" ]; then
    echo "ROLLBACK_DIRECTORY_PRESENT=$(basename "$old")"
  else
    echo "ROLLBACK_DIRECTORY_MISSING_OR_LINK=$(basename "$old")"
  fi
done
```

Для точной побайтовой проверки, **после CI и безопасной ff-only синхронизации DEV**, оператор вручную запускает:

```sh
cd /home/drpoh/projects/rs-home-ai-dev
node scripts/manual/v3-release-content-readonly.mjs --readonly --operator-approved
```

Верификатор сверяет Git `blob` SHA-1 каждого **отслеживаемого** файла с фактическими байтами закреплённого V3 релиза и отдельно проверяет только исполняемые биты файлов из Git. Он не сравнивает tar UID/GID/mtime или неисполняемые `chmod 600/644`: эти метаданные могут различаться после сборки, не меняя Git source. Результат `RELEASE_SOURCE_STATUS=PASS` требует `RELEASE_TRACKED_BYTES_MATCH=PASS` и `RELEASE_EXECUTABLE_BITS_MATCH=PASS`. При отсутствующих/изменённых файлах, неверном `RELEASE_COMMIT`, недоступном Git object, symlink вместо обычного файла, несовпадающих executable bits или ошибке чтения — `UNVERIFIED` и ненулевой код выхода. Вывод не содержит содержимого файлов или секретов.

**Подтверждённое наблюдение 2026-10-13:** прежний `git archive | tar --compare` вернул `UNVERIFIED` из-за расхождения `Mode/Uid/Gid`. После замены проверки **оператор запустил** `v3-release-content-readonly.mjs` на Pi и получил `RELEASE_SOURCE_STATUS=PASS`, `RELEASE_DECLARED_COMMIT=9dd5964a4956b88227ec4002ac80ef46a186d632`, `RELEASE_TRACKED_BYTES_MATCH=PASS`, `RELEASE_EXECUTABLE_BITS_MATCH=PASS`, `tracked=437`, `checked=437`, `missing/modified/typeMismatch/execModeMismatch/unsupported=0`, `RELEASE_CHECK_REASON=match`. Проверка подтвердила tracked source code **и исполняемые биты**, но не загруженный runtime и dependencies. Оба rollback каталога видны (`PRESENT`), не испытаны.

Обе команды только читают Git objects, release и systemd; **не запускают Telegram, `npm install`, restart, HA-MCP, `ha_call_service` и не создают или переключают release**. Запуск вручную, без `exit 1`, чтобы ошибка не разрывала SSH. `RELEASE_SOURCE_STATUS=PASS` относится лишь к tracked source, **не** к `node_modules`, дополнительным файлам, приватным конфигурациям, уже загруженным в память процессам или единственности Telegram poller. Совпадение одного `RELEASE_COMMIT` без сверки Git blobs не является доказательством целостности. `ExecStart` перед пересылкой нужно проверить на отсутствие неожиданных секретных аргументов.

Если `ExecStart` указывает на другой путь, отсутствует `RELEASE_COMMIT`, новый verifier возвращает `UNVERIFIED` либо нет rollback — **Gate D остаётся открытым**, никаких автоматических изменений сервисов. После read-only evidence отдельно проверить реальные poller/rollback/Telegram API через operator-approved release plan, а не выдавать systemd `active` за end-to-end PASS.

## Новый проверочный этап: локальные V2/V3 процессы без Telegram API

После read-only **437/437 tracked source PASS** (operator evidence, 2026-10-13) исходники закреплённого V3 подтверждены. Следующая проверка должна ответить на другой вопрос: **какие Node процессы реально привязаны к V2/V3 systemd MainPID**, не запуская Telegram polling.

После CI и безопасного `ff-only` обновления **только DEV**:

```sh
cd /home/drpoh/projects/rs-home-ai-dev
node scripts/manual/v3-runtime-readonly-preflight.mjs --readonly --operator-approved
```

Одноразовый скрипт читает `systemctl show -p ActiveState,MainPID` для системного V2 и пользовательского V3 и локальные `/proc/*/cmdline` + `cwd`. Содержимое аргументов, секреты, EnvironmentFile и URL **не выводятся**: сравниваются только заранее известные entrypoint `/home/drpoh/ha-telegram-bot/src/index.mjs` и pinned V3 `.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`. Результат содержит статусы `V2_MAIN_ENTRYPOINT_MATCH`, `V3_MAIN_ENTRYPOINT_MATCH`, PIDs и **счётчики** локальных процессов с этими entrypoint. Два разных ожидаемых MainPID и отсутствие дополнительных копий известных entrypoint дают `GATE_D_RUNTIME_READONLY=PASS`, недоступные процессы — `PARTIAL` или `UNVERIFIED`.

**Ограничение:** ни `PASS`, ни отсутствие локальных дубликатов не доказывает единственности Telegram `getUpdates` poller на всех хостах, правильность токена, доступность Telegram API, сохранность `node_modules`, отсутствие иных неизвестных запусков, реальный rollback или наличие сообщения пользователя. Новое физическое управление не разрешается. Для проверки токенов/Telegram API требуется отдельная согласованная процедура без их вывода. Не применять к production изменений от одного этого скрипта.

## Pi read-only acceptance и следующий Gate D этап (2026-10-13)

Оператор выполнил `v3-runtime-readonly-preflight.mjs --readonly --operator-approved`: **`GATE_D_RUNTIME_READONLY=PASS`**. `V2_SERVICE_ACTIVE=true`, `V3_SERVICE_ACTIVE=true`, PIDs **927** и **3713**, оба `MAIN_ENTRYPOINT_MATCH=true`, `SERVICE_PIDS_DISTINCT=true`, `KNOWN_ENTRYPOINT_PROCESS_COUNTS={"v2":1,"v3":1,"unreadable":0}`, дубликатов известных entrypoint нет. Отдельно ранее проверены **437/437 Git blob bytes + executable bits** pinned V3 релиза `9dd5964`, оба каталога rollback существуют. Это подтверждает только локальные процессы и tracked source; **не** Telegram polling по токену, установленные зависимости или функциональный откат.

Перед следующим операторским review разумнее использовать встроенный **`npm ls`** и штатный `test`, а не разрабатывать собственный менеджер зависимостей. Ниже — одноразовый **read-only** осмотр установленных production dependency trees и статической комплектности закреплённого V3 и двух сохранённых rollback-каталогов. Не запускает Node entrypoint, Telegram, HA-MCP, systemd или npm install; не печатает приватные конфигурации.

```bash
# Запуск от drpoh. Любая ошибка остаётся диагностическим UNVERIFIED.
for suffix in active c6a9812 97343fa; do
  case "$suffix" in
    active) dir=/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964 ;;
    *) dir="/home/drpoh/projects/rs-home-ai-v3-release-$suffix" ;;
  esac
  echo "=== GATE_D_DEPENDENCIES $suffix ==="
  if [ ! -d "$dir" ] || [ -L "$dir" ]; then
    echo "RELEASE_DIRECTORY=UNVERIFIED"
    continue
  fi
  if [ ! -f "$dir/RELEASE_COMMIT" ] || [ ! -f "$dir/package-lock.json" ] ||
     [ ! -f "$dir/package.json" ] ||
     [ ! -f "$dir/src/pilot/telegram-readonly.mjs" ]; then
    echo "RELEASE_STATIC_FILES=UNVERIFIED"
    continue
  fi
  read -r commit < "$dir/RELEASE_COMMIT"
  if ! [[ "$commit" =~ ^[0-9a-f]{40}$ ]]; then
    echo "RELEASE_COMMIT_MARKER=UNVERIFIED"
    continue
  fi
  if [ "$suffix" = active ]; then expected=9dd5964; else expected="$suffix"; fi
  if [[ "$commit" != "$expected"* ]]; then
    echo "RELEASE_COMMIT_MARKER=UNVERIFIED"
    continue
  fi
  echo "RELEASE_STATIC_FILES=PRESENT"
  echo "RELEASE_COMMIT_PREFIX_MATCH=true"
  if [ ! -d "$dir/node_modules" ] || [ -L "$dir/node_modules" ]; then
    echo "DEPENDENCY_TREE=UNVERIFIED"
    continue
  fi
  echo "DEPENDENCY_CHECK=RUNNING_OFFLINE"
  if npm --prefix "$dir" ls --omit=dev --all --offline --loglevel=silent > /dev/null 2>&1; then
    echo "DEPENDENCY_TREE=PASS_STATIC"
  else
    echo "DEPENDENCY_TREE=UNVERIFIED"
  fi
done
```

Здесь `PASS_STATIC` означает, что **на момент проверки** npm смог построить дерево локально установленных пакетов по package metadata. Это не подтверждает содержимое каждого пакета, успешность загрузки конкретного SDK, соответствие фактически загруженному коду в памяти, наличие приватной конфигурации или функциональность rollback. `UNVERIFIED` требует выяснить причину без автоматического ремонта и без повторной установки пакетов. `npm ls` выполняется в offline mode и не устанавливает зависимости; в случае ошибок npm может создать локальный diagnostic log, но не меняет release dependencies.

Только после этого можно подготовить отдельную операторскую процедуру Telegram end-to-end / однополлерного release с сохранением старых V2/V3 services. **Не запускать новый polling-клиент для проверки уникальности токена.** Gate D до такой процедуры остаётся OPEN.

## Исторические источники

[Операции](../V3-OPERATIONS.md) · [review 2026-10-09](../REVIEW-2026-10-09.md) · [план окружений](../ADR-DEV-STAGE-PROD.md) · [карта каталогов](../PROJECT-MAP.md).
