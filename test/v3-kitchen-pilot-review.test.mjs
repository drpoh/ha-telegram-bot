import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateV3OperatorPolicy} from '../src/decision/v3-operator-policy-schema.mjs';
test('kitchen pilot remains deny-all and excludes unresolved groups',()=>{
 const r=JSON.parse(readFileSync(new URL('../config/pilots/kitchen-review.json',import.meta.url)));
 const p=JSON.parse(readFileSync(new URL('../config/pilots/kitchen-policy-deny.json',import.meta.url)));
 assert.equal(r.area_id,'kukhnia');assert.equal(r.real_actions_enabled,false);
 assert.deepEqual(r.authorized_entity_ids,[]);
 assert.equal(r.candidate_light_ids.length+r.unresolved_light_ids.length,11);
 assert.equal(r.unresolved_switch_ids.length+r.excluded_switch_ids.length,5);
 assert.ok(r.unresolved_light_ids.includes('light.svet_kukhni'));
 assert.ok(r.unresolved_light_ids.includes('light.dukhovka_light'));
 assert.deepEqual(validateV3OperatorPolicy(p).policy.entities,{});
});
