import test from 'node:test';
import assert from 'node:assert/strict';
import {selectManualLights} from '../src/home/manual-light-selection.mjs';

test('manual selection accepts exact existing light candidates only',()=>{
 const r=selectManualLights(['light.kukhnia_svet','light.wled_gledopto']);
 assert.equal(r.status,'selected_for_review');
 assert.deepEqual(r.targets.map(x=>x.id),['light.kukhnia_svet','light.wled_gledopto']);
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.ok(r.targets.every(x=>x.readOnly&&x.review==='pending_physical_identity'));
});
test('manual selection rejects groups, browser mod, unknown and duplicates',()=>{
 for(const ids of [
  [],['light.browser_mod_screen'],['light.ves_svet'],['light.kukhnia_svet','light.kukhnia_svet'],
  ['switch.vannaia_svet'],['light.koridor'],[123],null
 ]){
  const r=selectManualLights(ids);
  assert.equal(r.status,'invalid');assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
  assert.deepEqual(r.targets,[]);
 }
});
