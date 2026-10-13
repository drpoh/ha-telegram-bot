import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const scriptUrl=new URL('../scripts/manual/v3-telegram-questions-readonly-preflight.mjs',import.meta.url);
const src=readFileSync(scriptUrl,'utf8');

test('manual natural Telegram preflight refuses to start without explicit owner flags',()=>{
 const bad=spawnSync(process.execPath,[scriptUrl.pathname],{encoding:'utf8',timeout:10000});
 assert.equal(bad.status,2);
 assert.match(bad.stderr,/--readonly --operator-approved/);
 assert.doesNotMatch(bad.stdout,/TELEGRAM_QUESTION_/);
 const extra=spawnSync(process.execPath,[scriptUrl.pathname,'--readonly','--operator-approved','--write'],{encoding:'utf8',timeout:10000});
 assert.equal(extra.status,2);
});

test('manual preflight explicitly fixes four Russian natural queries and read-only ID scopes',()=>{
 const check=spawnSync(process.execPath,['--check',scriptUrl.pathname],{encoding:'utf8',timeout:10000});
 assert.equal(check.status,0,check.stderr);
 for(const phrase of [
  'Сколько градусов в сауне?','Горит ли свет в тамбуре?',
  'Где горит свет?','Что со светом на кухне?'
 ])assert.ok(src.includes(phrase),phrase);
 assert.match(src,/routeV3ReadonlyQuestion\(\{text,readState,readKitchenState\}\)/);
 assert.match(src,/LIGHT_OVERVIEW_IDS/);
 assert.match(src,/REVIEWED_KITCHEN_LIGHTS\.map\(item=>item\.id\)/);
 assert.match(src,/!generalIds\.has\(id\)/);
 assert.match(src,/!kitchenIds\.has\(id\)/);
 assert.match(src,/generalClient\('ha_get_state',\{entity_id:id\}\)/);
 assert.match(src,/const readKitchenState=id=>/); // no arbitrary names or implicit write path
 assert.match(src,/TELEGRAM_QUESTIONS_HA_WRITE_ATTEMPTED=false/);
 assert.match(src,/TELEGRAM_QUESTIONS_TELEGRAM_POLLER_STARTED=false/);
 assert.match(src,/complete===probes\.length\?0:1/);
 assert.doesNotMatch(src,/ha_call_service|\.dispatch\(|bot\.launch\(|new Telegraf|startTelegram\(|generateAI\(/);
});

test('preflight reports failures without raw MCP errors or false claim of authorization',()=>{
 assert.match(src,/result\.authorization!==false/);
 assert.match(src,/result\.actualWrite!==false/);
 assert.match(src,/!\['complete','partial','unavailable'\]\.includes\(result\.status\)/);
 assert.match(src,/TELEGRAM_QUESTIONS_READONLY=/);
 assert.match(src,/PHYSICAL_IDENTITY=unverified/);
 assert.doesNotMatch(src,/console\.log\(.*(?:error\.message|endpoint\.url|client\.callTool)/);
});
