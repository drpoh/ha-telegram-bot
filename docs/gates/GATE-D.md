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

## Проверка статических зависимостей и старого backup (2026-10-13)

Владелец выполнил штатную **read-only** проверку структуры и `npm ls --omit=dev --all --offline`:

- **Активный** `9dd5964`: `RELEASE_STRUCTURE=PRESENT`, `DEPENDENCIES=PASS_STATIC`.
- **Основной rollback** `c6a9812`: `RELEASE_STRUCTURE=PRESENT`, `DEPENDENCIES=PASS_STATIC`.
- **Вторичный исторический rollback** `97343fa`: первоначально `RELEASE_STRUCTURE=UNVERIFIED` от составного `if`. Операторский покомпонентный осмотр затем установил **единственное отсутствующее условие: `RELEASE_COMMIT=MISSING`**; `directory`, `package.json`, `package-lock.json`, `src/pilot/telegram-readonly.mjs` и `node_modules` присутствуют. Дерево установленных зависимостей legacy архива по-прежнему **не проверено**. Новый release-marker не следует задним числом требовать от старой сборки или создавать ради PASS.

Исторический GitHub commit `97343fa81b1af0c73ee2f061ed65fe1939ea488a` **содержит** `package.json`, `package-lock.json` и `src/pilot/telegram-readonly.mjs`. Наличие их в Git не доказывает наличие на Pi; прежняя папка `97343fa` ранее существовала. Не считать этот резерв пригодным к оперативному restore, пока не выявлен конкретный blocker. Основной `c6a9812` статически комплектен, но ещё не испытан как восстановление.

**Следующий короткий read-only осмотр на Pi** (выводит только тип объекта и совпадение префикса SHA, без содержимого или токенов):

```bash
d=/home/drpoh/projects/rs-home-ai-v3-release-97343fa
for x in . RELEASE_COMMIT package.json package-lock.json src/pilot/telegram-readonly.mjs node_modules; do
  if [ "$x" = . ]; then p="$d"; else p="$d/$x"; fi
  if [ -L "$p" ]; then state=SYMLINK
  elif [ -d "$p" ]; then state=DIRECTORY
  elif [ -f "$p" ]; then state=FILE
  else state=MISSING; fi
  printf '%s=%s\n' "$x" "$state"
done
if [ -f "$d/RELEASE_COMMIT" ] && [ ! -L "$d/RELEASE_COMMIT" ]; then
  read -r sha < "$d/RELEASE_COMMIT"
  if [[ "$sha" =~ ^97343fa[0-9a-f]{33}$ ]]; then
    echo RELEASE_COMMIT_PREFIX=PASS
  else
    echo RELEASE_COMMIT_PREFIX=UNVERIFIED
  fi
else
  echo RELEASE_COMMIT_PREFIX=UNVERIFIED
fi
```

Не выполнять `npm ci`, `npm install`, `chmod`, перемещение или удаление старого каталога для «исправления» диагностики. `RELEASE_STRUCTURE=UNVERIFIED` может быть следствием отсутствующего marker/installed deps или symlink, а не порчи tracked source. Команды не выключают процесс, не запускают Telegram и не посылают HA-MCP запросов.

**Следующий пользовательский Telegram acceptance без deployment:** в **уже работающем V3 боте**, с которым пользователь общался прежде, команды `/status` и `/sauna` есть в проверенном pinned исходнике `9dd5964`. Можно отдельно запросить эти два **read-only** ответа владельца. Не запускать второй экземпляр бота, не использовать `/confirm` или новые физические команды. Такой опыт подтверждает только текущий pinned V3 Telegram path, **не** будущие DEV natural-language kitchen возможности и **не** token-level uniqueness. Gate D остаётся OPEN до отдельно согласованного полного release/rollback review.

## Legacy rollback `97343fa`: корректная проверка без RELEASE_COMMIT

В исходном Git commit `97343fa81b1af0c73ee2f061ed65fe1939ea488a` `RELEASE_COMMIT` **не отслеживается** (новый build marker создаётся отдельно при упаковке). Его отсутствие в старом каталоге не означает, что три исходных файла повреждены. Для этого **исторического, неработающего** backup выполняются независимые неразрушающие проверки:

```bash
d=/home/drpoh/projects/rs-home-ai-v3-release-97343fa
dev=/home/drpoh/projects/rs-home-ai-dev
sha=97343fa81b1af0c73ee2f061ed65fe1939ea488a

if [ ! -L "$d" ] && [ -d "$d" ] && [ -d "$d/node_modules" ] &&
   [ ! -L "$d/node_modules" ]; then
  if npm --prefix "$d" ls --omit=dev --all --offline --loglevel=silent >/dev/null 2>&1; then
    echo LEGACY_DEPENDENCIES=PASS_STATIC
  else
    echo LEGACY_DEPENDENCIES=UNVERIFIED
  fi
else
  echo LEGACY_DEPENDENCIES=UNVERIFIED
fi

if git -C "$dev" cat-file -e "$sha^{commit}" 2>/dev/null; then
  for file in package.json package-lock.json src/pilot/telegram-readonly.mjs; do
    expected=$(git -C "$dev" rev-parse "$sha:$file" 2>/dev/null)
    if [ -f "$d/$file" ] && [ ! -L "$d/$file" ] &&
       [ "$(git hash-object "$d/$file" 2>/dev/null)" = "$expected" ]; then
      echo "LEGACY_GIT_FILE_MATCH=$file PASS"
    else
      echo "LEGACY_GIT_FILE_MATCH=$file UNVERIFIED"
    fi
  done
else
  echo LEGACY_GIT_COMMIT=UNAVAILABLE
fi
```

Эта команда не создаёт marker, не записывает Git objects (`git hash-object` без `-w`), не переустанавливает пакеты и не запускает Telegram или HA. Три совпавших файла и `npm ls` могут подтвердить лишь **ограниченную статическую проверку**; полный `git tree` старой сборки, token-level poller и работоспособность восстановления всё равно остаются непроверенными. При `UNVERIFIED` ничего автоматически не исправлять.

## Legacy rollback: 3/3 Git blob PASS и npm static PASS

**Фактический ответ оператора Pi, 2026-10-13:** `LEGACY_DEPENDENCIES=PASS_STATIC`, затем:

```text
package.json=PASS
package-lock.json=PASS
src/pilot/telegram-readonly.mjs=PASS
```

Это означает, что все **три выбранных файла** сохранённого старого каталога `rs-home-ai-v3-release-97343fa` побайтово совпали с Git commit `97343fa81b1af0c73ee2f061ed65fe1939ea488a`; локальное `npm ls --offline` прошло. Ошибка `RELEASE_STRUCTURE=UNVERIFIED` прежнего составного preflight вызвана требованием отсутствующего legacy `RELEASE_COMMIT`. Отсутствие marker **не** означает битые исходники; добавлять его, править или пересобирать old rollback не нужно.

Теперь статический `npm ls --offline` прошёл в **active `9dd5964`, primary fallback `c6a9812` и legacy `97343fa`**. Однако полная целостность отслеживаемых файлов в legacy и primary rollback ещё не аттестована, а работа recovery не испытана. Не писать `Gate D complete` только на основании npm и трёх хешей.

**Следующий независимый приемочный шаг:** через **уже запущенный приватный V3 Telegram чат** проверить входящие команды `/status` и `/sauna` закреплённого `9dd5964`; не создавать новый poller и не посылать `/confirm` или команды физического управления. Сообщения от бота являются свидетельством Telegram ingress, авторизации owner и HA-MCP read-only только в рамках этих двух команд, но не подтверждают единственность poller по токену/на других хостах или будущую DEV-версию.

## Действующий V3: live Telegram natural read-only приёмка (2026-10-13)

Владелец отправил сообщения **в уже работающий приватный `RSHomeAI_v3_bot`** (pinned production `9dd5964`). Получены следующие ответы, все без нового сервиса и без физического управления:

- `/status` → «RS Home AI v3: защищённый журнал доступен. Для реальной команды требуется /confirm и проверка разрешений.» Это подтверждает ответ Telegram и флаг готовности журнала **в момент запроса**, не стабильность журнала при рестарте.
- `/confirm` **без действующего pending запроса** → «Нет действующего запроса для подтверждения». Это один успешный негативный кейс без HA write, не полный replay/consent-тест.
- `/sauna` → **88.625 °C**, готовность true, порог 85 °C. Это подтверждает Telegram → pinned V3 → HA-MCP read-only sauna route.
- «Сколько градусов в сауне?» → **89 °C**, готова (85 °C threshold).
- «Где горит свет?» → **из ровно четырёх выбранных `light.*` сущностей HA: 0 ON, 4 OFF, 0 UNKNOWN**. Вывод *не* является инвентаризацией всего дома или количеством физических ламп.
- «Горит ли свет в тамбуре?» → off. Это отдельный ответ на естественную фразу, не разрешение действовать.

**Итог:** pinned V3 **Telegram ingress + owner-specific read-only answers + HA-MCP** проверены для перечисленных запросов. Gate D **остаётся OPEN**: полный Telegram функционал DEV не запущен, глобальная/token-level единственность Telegram poller не аттестована, реальные исправность/откат резервного релиза и полная целостность установленных runtime dependencies не испытаны.

## Ограниченный следующий релиз: безопасный read-only Telegram rollout (план, не разрешение)

Сравнение GitHub `9dd5964...fabfaa7` показывает **116 коммитов / 121 изменённый файл**, включая исходный `src/pilot/telegram-readonly.mjs`. Нельзя считать DEV одним маленьким патчем и без изучения состава изменений переключить pinned production. Следующий **практический** функционал — статус четырёх отобранных световых HA-сущностей кухни в естественном Telegram вопросе. Уже есть DEV deterministic read-only question router и тесты; **reuse first**, не создавать ещё одного бота, API или policy engine.

Перед любым owner-approved promote отдельно проверить, что кандидат:

1. Не меняет доверенные chat/user identity, private config, Telegram credentials, journal и текущую policy/confirmation/physical capability границу.
2. Не вызывает никаких `ha_call_service`/физических записей при вопросах о кухне/сауне/тамбуре/свете, не маскирует `unavailable` под OFF и не говорит «весь дом» на основании четырёх ID.
3. Использует неизменяемый release artifact, локальную static/source provenance, существующий CI и один **действующий** V3 Telegram poller; никакого параллельного `bot.launch` при подготовке.
4. Имеет предварительно проверенный rollback к работавшему `9dd5964`, прямой способ проверить V2/HA independence и отдельное явное owner approval для systemd/release переключения. Простого `npm test` недостаточно.

Пока это **план**, а не автоматическое развертывание. Допускаются offline source review/фикстуры, но production V2/V3 и Home Assistant Green не изменяются.

### Первое применение selective spec/security review (только исходники, 2026-10-13)

**Spec-проверка (read-only kitchen question):** DEV `routeV3ReadonlyQuestion` распознаёт выбранные кухонные формулировки, вызывает `summarizeReviewedKitchenLights` через отдельный `createReviewedLightReadonlyReader` и возвращает `authorization:false`, `actualWrite:false`; список содержит **ровно четыре выбранных** `light.*`, а не полную физическую инвентаризацию кухни. Для `unknown/unavailable` сохраняется отдельный счётчик; пользовательский текст должен прямо сообщать, что физическая идентичность не подтверждена. Считать это пока **DEV source evidence**, не реальным Telegram acceptance.

**Standards/security-проверка (избирательная, не полный аудит):** DEV `src/pilot/telegram-readonly.mjs` по сравнению с pinned `9dd5964` содержит не только изменения read-only router, но также `/newlights`, `/newlight`, `/lightcheck`, новые ветки `/confirm`, `/cancel` и `pendingNewLights`. `createNewLightDispatch({releaseEnabled:false,approvedIds:[]})` блокирует новые физические write-действия **в текущем DEV source**, но не заменяет дифф-аудит consent/journal. Потребуется отдельно доказать, что никакое сообщение или гонка с `/confirm` не создаёт новых разрешений и не изменяет старое допущенное поведение тамбура.

**Решение:** **NO-GO для прямого переноса всей DEV в V3 prod**; сохранённый `9dd5964` работает и подтверждён реальными read-only ответами. Следующая работа — небольшой read-only-only release patch/review c отрицательными тестами сообщений, actor/chat, ambiguous/unknown entities, никакого `ha_call_service` и прежних `/confirm` semantics. Повторный CI и Pi DEV evidence после изменения; переключение `systemd` — отдельный owner-approved шаг с single-poller/recovery проверкой.

Дисциплина и критерии обоих review-осей: [выборочный engineering playbook](../development/ENGINEERING-PRACTICES.md).

## DEV kitchen read-only release boundary (offline review, 2026-10-13)

The first real use of the adopted [engineering practices](../development/ENGINEERING-PRACTICES.md) is a **minimal kitchen question slice**, not a new application. The current DEV source handles `Что со светом на кухне?` by reading **four selected IDs** (`light.kukhnia_led_niz_l1`, `light.kukhnia_led_niz_l2`, `light.kukhnia_svet`, `light.led_kukhnia`) and must report `unavailable` separately from `off`. The identity of `light.kukhnia_svet` remains Gate B **UNVERIFIED**; no physical action authority derives from a read.

**Two-axis review:** spec scope = one private Telegram read-only question; standards/safety = exact four-entity allowlist, owner authorization, no `ha_call_service`, no altered consent, no additional poller, no credential or URL exposure, unknown != off. Added offline regression test `test/v3-kitchen-release-readonly-boundary.test.mjs` for exact state reads, unavailable counts, mixed action/question denial, dispatcher disabled even with supplied approval, and Telegram owner/router/physical-fallback ordering.

**Change size:** GitHub comparison from pinned `9dd5964` to DEV `39b4fce` has **118 commits and 123 changed files**. The source `telegram-readonly.mjs` also contains unrelated `/newlight`, `/confirm`, `/cancel` and claim-related changes. A full DEV candidate **remains NO-GO**; this test is evidence for **future** scoped packaging, not permission to deploy or an assertion that a minimal release exists. A later candidate must prove how it isolates the read-only delta from consent and action changes.

**Next action after offline tests:** prepare a **separately reviewed** minimal immutable candidate or integration approach that cannot touch existing V3 physical/Telegram authorization boundaries; verify source hashes and rollback with the old `9dd5964`, then seek explicit owner approval before any production `systemd` change. Do **not** run a second Telegram poller even for staging.

## Небольшое предложение релиза от pinned SHA — PR #134 (не развёрнуто)

Чтобы избежать переноса 100+ DEV коммитов, открыт [отдельный исходный PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134) **на Git базе `9dd5964`**. Подготовлено только 6 изменённых файлов: 3 DEV-модуля для детерминированного read-only отчёта о 4 выбранных кухонных `light.*`; 1 строка `kitchen_review` в classifier; импорт и маршрут в pinned Telegram entrypoint (**2 новые строки, ни одной старой не изменено**); 1 offline `node:test`. Старый `/confirm`, `/cancel`, claims journal, admission, `pilot.request`, owner/chat gate, `bot.launch` не изменены. Ветка кандидата не служит запуском или production.

**Ограничение CI:** у pinned workflow `.github/workflows/offline-node.yml` `pull_request.branches: [feature/v3-home-agent]`; PR #134 в отдельную release-base ветку **не вызывает GitHub CI**. Не выдавать его за прошедший тест. Предпочтительный следующий шаг — вручную **только offline isolated worktree** на Raspberry Pi, без изменения DEV branch или работающих сервисов:

```bash
dev=/home/drpoh/projects/rs-home-ai-dev
stage=/home/drpoh/projects/rs-home-ai-v3-kitchen-offline-proposal
if [ ! -e "$stage" ] && [ ! -L "$stage" ] &&
   [ "$(git -C "$dev" branch --show-current)" = "feature/v3-home-agent" ] &&
   [ -z "$(git -C "$dev" status --porcelain)" ]; then
  git -C "$dev" fetch origin refs/heads/release-proposal/v3-kitchen-readonly-20261013 &&
  git -C "$dev" worktree add --detach "$stage" FETCH_HEAD &&
  (
    cd "$stage" &&
    node --check src/pilot/telegram-readonly.mjs &&
    node --check src/home/readonly-question-intent.mjs &&
    node --check src/home/kitchen-light-readonly-status.mjs &&
    node --test test/v3-pinned-kitchen-readonly-proposal.test.mjs
  )
else
  echo OFFLINE_STAGE=SKIPPED_UNVERIFIED
fi
```

Команда не устанавливает зависимости, не запускает entrypoint, не подключается к HA-MCP и не вызывает Telegram API, не копирует приватные токены. Она создаёт отдельный **тестовый worktree**; не выполнять `npm install`, `systemctl restart`, `bot.launch` или `ha_call_service`. Результат проверяет лишь офлайн-функции и Node syntax, **не** весь ARMv7 release/Telegram/rollback. После результата нужна полноценная отдельная приёмка, включая CI на exact candidate commit и explicit owner approval перед переключением производства.

## Verification-only CI и source artifact кухни — 2026-10-14 (НЕ разрешение на выпуск)

**Новая актуальная проверка замещает предыдущую 6-file/unverified CI заметку только в отношении кода, а не эксплуатации.** [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134) теперь `base=9dd5964a4956b88227ec4002ac80ef46a186d632`, `head=e902efeb923a2090ca0d188e92d1ccdc28d1627e`, diff **7 файлов**. Седьмой — единственное исправление устаревшего offline-теста для нового вопроса `«Какой свет на кухне?»`, **ни одной дополнительной runtime строки**. В `src/pilot/telegram-readonly.mjs` по-прежнему только два добавления: импорт и строго read-only маршрут `ha_get_state`. Проверка GitHub Actions восстановила **побайтовое равенство всех ранее существовавших строк entrypoint** путём вычитания ровно двух новых строк; это сильное доказательство неизменности source-consent, но не эксплуатационная приёмка.

[Временный verification-only PR #139](https://github.com/drpoh/ha-telegram-bot/pull/139) создан только для запуска workflow без изменения release base или head source workflow. Внутри CI **literal checkout именно candidate SHA**, даже если status check относится к ветке test harness; [run 38503518196](https://github.com/drpoh/ha-telegram-bot/actions/runs/38503518196) **SUCCESS**: Node v20.20.2, 4 focused assertions, full `npm test` **176 test files / 672 passed assertions / 0 failed files**. PR #139 **закрыт без merge**. Первый полный прогон на предыдущем candidate `cdcfdcda` обнаружил один старый неверный тест; теперь он исправлен и вся suite зелёная. Не заявлять, что GitHub status PR #134 непосредственно прошёл workflow: результаты отдельного harness должны проверяться по логам и exact SHA.

CI создал **source-only** детерминированный архив без `node_modules`, с `RELEASE_COMMIT=e902efeb923a2090ca0d188e92d1ccdc28d1627e`, прошедшим `SHA256SUMS` self-check. Artifact `11867150164` (ZIP digest `sha256:baca7ab088b90de426bd9e962feb9e2ea48716c4be801e54fc06845894de03cf`), expires 2026-10-28 UTC. Не путать ZIP digest с SHA256 внутреннего tar.gz: его значение находится в отдельном `SHA256SUMS`. Истечение GitHub artifact не удаляет Git commit.

**Блокирующие условия перед любым production switch:**
1. Изолированная **Pi Node20/ARMv7** проверка точного candidate SHA: `node --check`, targeted `node --test`, source marker, dependencies, read-only mock, без живого poller и HA writes. Существующий GitHub x64 CI не подменяет ARMv7.
2. Повторный read-only Gate D: существующий активный `9dd5964` и основной backup `c6a9812` (папки, installed deps, ExecStart, PID), отсутствие нежелательных конкурирующих Telegram pollers *по одному токену*, сохранность V2/HA; без печати secrets. Процедура реального восстановительного запуска всё ещё не выполнена.
3. **Отдельное явное owner approval** на включение новой версии. При утверждённом switch план строго `stop old V3 → confirm stopped → start exactly one new V3 → read-only Telegram kitchen acceptance`. При ошибке `stop candidate → restore verified 9dd5964 → confirm exactly one V3 poller`; не стартовать одновременно два V3. Никогда не менять V2 или HA Green в ходе выпуска V3.
4. Gate B по `light.kukhnia_svet` остаётся **OPEN** независимо от успеха read-only релиза. Никаких новых физических write-разрешений или автоматического повышения автономности.

До выполнения этих условий: **Gate D OPEN; production deployment NO-GO**.

## Исторические источники

[Операции](../V3-OPERATIONS.md) · [review 2026-10-09](../REVIEW-2026-10-09.md) · [план окружений](../ADR-DEV-STAGE-PROD.md) · [карта каталогов](../PROJECT-MAP.md).
