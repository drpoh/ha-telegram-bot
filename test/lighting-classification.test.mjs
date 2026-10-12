import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {loadLightingClassification,resolveReviewedClassification} from '../src/decision/lighting-classification.mjs';
async function withConfig(doc,fn) {
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'light-map-'));
 const file=path.join(dir,'map.json');
 try { await fs.writeFile(file,JSON.stringify(doc));return await fn(file); }
 finally {await fs.rm(dir,{recursive:true,force:true});}
}
const config={version:1,areas:[{area_id:'bath',area_name:'Ванная и Сауна',
 light_ids:['light.wled'],excluded_light_ids:['light.status_led'],
 switch_light_ids:['switch.vannaia_svet']}]};
test('no local config fails closed',async()=>assert.equal((await loadLightingClassification()).ok,false));
test('reviewed config loads and resolves exact HA ID and display name',async()=>{
 await withConfig(config,async file=>{
  const loaded=await loadLightingClassification({path:file});
  assert.equal(loaded.ok,true);
  const r=resolveReviewedClassification(loaded,'bath','Ванная и Сауна');
  assert.equal(r.ok,true);
  assert.deepEqual(r.classification.excludedLightIds,['light.status_led']);
  assert.equal(resolveReviewedClassification(loaded,'bath','Ванная').ok,false);
 });
});
test('overlapping classifications are rejected',async()=>{
 const bad=structuredClone(config);
 bad.areas[0].excluded_light_ids=['light.wled'];
 await withConfig(bad,async file=>assert.equal((await loadLightingClassification({path:file})).ok,false));
});
test('wrong-domain classifications are rejected',async()=>{
 const bad=structuredClone(config);
 bad.areas[0].switch_light_ids=['light.bad'];
 await withConfig(bad,async file=>assert.equal((await loadLightingClassification({path:file})).ok,false));
});
test('duplicate areas rejected',async()=>{
 const bad=structuredClone(config);
 bad.areas.push({...bad.areas[0]});
 await withConfig(bad,async file=>assert.equal((await loadLightingClassification({path:file})).ok,false));
});
