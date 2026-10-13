import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const bot=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
const manual=readFileSync(new URL('../scripts/manual/v3-single-light-readonly-preflight.mjs',import.meta.url),'utf8');
test('Telegram exact-ID check uses dedicated limited reader, not action-capable pilot client',()=>{
 const begin=bot.indexOf("bot.command('lightcheck'");
 const end=bot.indexOf('\n});',begin);
 assert.ok(begin>0&&end>begin);
 const handler=bot.slice(begin,end+4);
 assert.match(bot,/const newLightRead=createReviewedLightReadonlyReader\(\)/);
 assert.match(handler,/inspectSingleNewLight\(/);
 assert.match(handler,/readState:id=>newLightRead\(id\)/);
 assert.doesNotMatch(handler,/saunaRead|ha_call_service|\.dispatch\(/);
 assert.match(bot,/createNewLightDispatch\(\{releaseEnabled:false,approvedIds:\[\]\}\)/);
});
test('manual single light preflight is opt-in, no poller, and never calls HA service',()=>{
 assert.match(manual,/--readonly/);
 assert.match(manual,/--operator-approved/);
 assert.match(manual,/NEW_LIGHT_IDS\.includes\(args\[2\]\)/);
 assert.match(manual,/createReviewedLightReadonlyReader\(\)/);
 assert.match(manual,/SINGLE_LIGHT_PHYSICAL_IDENTITY=unverified/);
 assert.doesNotMatch(manual,/ha_call_service|turn_on|turn_off|bot\.launch|new Telegraf/);
});
