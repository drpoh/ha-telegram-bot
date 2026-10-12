# Raspberry Pi 3 — Reference Snapshot

> **Reference only**, captured 2026-10-08 (Finland). Values are point-in-time observations from authorized read-only shell commands on `raspberrypi`. This file is **not** deployment authorization, a hardware requirement, or a performance guarantee. Do not store identifiers, secrets, IP addresses or database contents here.

## Hardware and operating system

| Field | Snapshot |
|---|---|
| Board | Raspberry Pi 3 Model B Rev 1.2 |
| CPU | ARMv7l / 32-bit, 4 cores, 600–1200 MHz |
| OS | Raspbian GNU/Linux 13 (trixie) |
| Kernel | 6.12.47+rpt-rpi-v7 |
| Physical RAM | 921 MiB usable |
| RAM used / available | 527 MiB used / 393 MiB available |
| Swap | 920 MiB zram, 237 MiB used |
| Load average (1/5/15 min) | 0.96 / 1.29 / 1.07 |
| Temperature | 60.1 °C when measured |
| Throttle status | `vcgencmd get_throttled = 0x0` (at sample time only) |
| Storage | microSD block device `mmcblk0`, nominal 58.2 GiB |
| Root filesystem | 57 GiB available filesystem size; 7.6 GiB used, 47 GiB free, 14% used |
| Inodes | ~8% used |
| Network | `eth0` UP, `wlan0` DOWN at capture time |
| Node.js (shell) | v20.19.2 |

## Project footprint (`/home/drpoh/ha-telegram-bot`)

| Item | Disk use |
|---|---:|
| Project directory, including ignored dependencies and data | ~69 MiB |
| `node_modules/` | ~62 MiB |
| `.git/` | ~5.4 MiB |
| `data/` | ~1.1 MiB |
| Working tree excluding `.git`, `node_modules`, `data` | ~864 KiB |
| `src/` | ~396 KiB |
| `test/` | ~192 KiB |
| `docs/` | ~92 KiB |
| `scripts/` | ~24 KiB |
| Tracked Git files | 143 |

Snapshot branch: `feature/v3-home-agent`, commit `c08fcc2` before this documentation change. Git working tree was clean at inspection.

## SQLite (aggregate metadata only)

`data/bot.db` was ~116 KiB on disk; additional SQLite files at snapshot: `bot.db-shm` 32 KiB, `bot.db-wal` 0 B, and a separately retained older backup ~108 KiB. `PRAGMA integrity_check` returned `ok`; page count 29 × 4096 bytes, journal mode WAL.

Table row counts at this snapshot: `memory` 3, `devices` 0, `conversation` 40, `learned_devices` 5, `ai_scene_entities` 3, `ai_scenes` 1. Counts are not a health check for their contents. **Do not commit the SQLite database**, even if small: it includes private conversation and device data.

## Observed concurrent services and memory considerations

Resident processes observed included the Home Assistant Telegram bot, Vinted sales agent, n8n, Tor, Cloudflare Tunnel, Docker daemon, and remote administration components. For orientation, RSS samples included Home Assistant bot ~75 MiB, Vinted bot ~51 MiB, n8n ~60 MiB, Tor ~33 MiB, and each of two large remote-management Node processes ~112–114 MiB. RSS figures overlap shared memory and must **not** be summed as exact total RAM usage.

The 1 GiB-class RAM capacity is the binding hardware constraint. zram utilization and the simultaneous Node processes mean memory pressure may become noticeable under tests, compilation or multiple bots. Disk capacity is currently comfortable; microSD endurance and clean shutdown/backups matter more than storage capacity. The board is suitable for light Telegram/MCP orchestration and small supporting services, not as a practical host for a modern fully local language model.

## Project / operational boundaries

- Raspberry Pi hosts supporting services; Home Assistant itself runs separately.
- Preserve the production bot and `data/bot.db`. Do not restart services or call HA state-changing tools as part of reference audits.
- V3 branch is **not** approved for production; Gate B remains open. Scene operations remain blocked until authorization is fully integrated.
- The test runner now uses separate temporary SQLite databases, but currently reads production database **schema** to bootstrap tests. Replacing this schema dependency with a committed sanitized schema fixture remains a follow-up.
- Refresh this file only after a deliberate read-only audit. Measurement fluctuations do not require a Git change.

## Reproduction commands (read-only)

```sh
cat /proc/device-tree/model
uname -a
free -h
uptime
df -h /
lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS
vcgencmd measure_temp
vcgencmd get_throttled
cd /home/drpoh/ha-telegram-bot
git status --short
git count-objects -vH
du -sh .git data node_modules src test docs scripts
du -sh --exclude=.git --exclude=node_modules --exclude=data .
ls -lh data/bot.db*
sqlite3 -readonly data/bot.db 'PRAGMA page_count; PRAGMA page_size; PRAGMA integrity_check;'
```
