import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LIGHT_OVERVIEW_IDS} from '../src/home/light-overview.mjs';
test('operator inventory remains bounded to prior seven HA IDs and no registry/write call',()=>{
 const script=readFileSync(new URL('../scripts/manual/v3-live-readonly-preflight.mjs',import.meta.url),'utf8');
 assert.match(script,/for\(const id of LIGHT_OVERVIEW_IDS\)/);
 assert.match(script,/LIGHT_INVENTORY/);
 assert.match(script,/read\('ha_get_state',\{entity_id:id\}\)/);
 assert.doesNotMatch(script,/ha_search|ha_call_service|ha_get_overview|ha_config_/);
 assert.equal(LIGHT_OVERVIEW_IDS.length,7);
});
