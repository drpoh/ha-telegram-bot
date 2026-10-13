import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RESPONDING_NEW_LIGHT_IDS,UNAVAILABLE_NEW_LIGHT_IDS} from '../src/home/responding-new-light-batch.mjs';
test('operator-only new-light inventory is exact and never a claim of live states',()=>{
 const source=readFileSync(new URL('../src/pilot/telegram-readonly.mjs',import.meta.url),'utf8');
 const begin=source.indexOf("bot.command('newlights'");
 // Inspect this handler only; adjacent independent commands may perform scoped HA reads.
 const end=source.indexOf('\n});',begin);
 assert.ok(begin>0&&end>begin);
 const handler=source.slice(begin,end+4);
 assert.match(handler,/if\(!allow\(ctx\)\)return/);
 assert.match(handler,/RESPONDING_NEW_LIGHT_IDS\.map/);
 assert.match(handler,/текущее состояние не проверено/);
 assert.doesNotMatch(handler,/ha_call_service|ha_get_state/);
 assert.equal(RESPONDING_NEW_LIGHT_IDS.length,9);
 assert.equal(UNAVAILABLE_NEW_LIGHT_IDS.length,10);
});
