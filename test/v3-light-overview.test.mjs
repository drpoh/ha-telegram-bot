import test from 'node:test';
import assert from 'node:assert/strict';
import {LIGHT_OVERVIEW_IDS,summarizeLightOverview} from '../src/home/light-overview.mjs';
test('bounded complete light overview reads only four reviewed remaining entities',async()=>{
 const seen=[];
 const r=await summarizeLightOverview({readState:async id=>{seen.push(id);return {structuredContent:{data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[0]||id===LIGHT_OVERVIEW_IDS[2]?'on':'off'}}};}});
 assert.deepEqual(LIGHT_OVERVIEW_IDS,['light.tambur_svet_l1','light.koridor','light.koridor_1_etazh','light.koridor_spot']);
 assert.deepEqual(seen,LIGHT_OVERVIEW_IDS);assert.equal(r.status,'complete');assert.equal(r.onCount,2);assert.equal(r.offCount,2);assert.equal(r.unknownCount,0);assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);assert.match(r.text,/4 выбранных сущностей HA, не число физических ламп/);
});
test('bad or missing HA data is unknown rather than silently off',async()=>{
 const r=await summarizeLightOverview({readState:async id=>id===LIGHT_OVERVIEW_IDS[0]?{data:{entity_id:id,state:'on'}}:id===LIGHT_OVERVIEW_IDS[1]?{data:{entity_id:'light.impersonator',state:'off'}}:{isError:true}});
 assert.equal(r.status,'partial');assert.equal(r.onCount,1);assert.equal(r.offCount,0);assert.equal(r.unknownCount,3);assert.match(r.text,/Требуют проверки/);
});
test('transport faults are bounded to unknown on every requested state',async()=>{
 const r=await summarizeLightOverview({readState:async()=>{throw Error('MCP unavailable')}});
 assert.equal(r.status,'partial');assert.equal(r.unknownCount,4);assert.equal(r.actualWrite,false);
 const noClient=await summarizeLightOverview();assert.equal(noClient.status,'unavailable');
});

test('unavailable entity IDs stay explicitly visible, not counted as physical lights',async()=>{
 const r=await summarizeLightOverview({readState:async id=>({data:{entity_id:id,state:id==='light.koridor_spot'?'unavailable':'off'}})});
 assert.equal(r.status,'partial');
 assert.equal(r.unknownCount,1);
 assert.equal(r.offCount,3);
 assert.ok(r.text.includes('light.koridor_spot'));
 assert.match(r.text,/не число физических ламп/);
 assert.equal(r.authorization,false);
 assert.equal(r.actualWrite,false);
});
