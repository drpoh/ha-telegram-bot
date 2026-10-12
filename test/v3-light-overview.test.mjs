import test from 'node:test';
import assert from 'node:assert/strict';
import {LIGHT_OVERVIEW_IDS,summarizeLightOverview} from '../src/home/light-overview.mjs';
test('bounded complete light overview reads only seven exact entities',async()=>{
 const seen=[];
 const r=await summarizeLightOverview({readState:async id=>{seen.push(id);return {structuredContent:{data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[0]||id===LIGHT_OVERVIEW_IDS[2]?'on':'off'}}};}});
 assert.deepEqual(seen,LIGHT_OVERVIEW_IDS);assert.equal(r.status,'complete');assert.equal(r.onCount,2);assert.equal(r.offCount,5);assert.equal(r.unknownCount,0);assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);assert.match(r.text,/7 выбранных сущностей HA, не число физических ламп/);
});
test('bad or missing HA data is unknown rather than silently off',async()=>{
 const r=await summarizeLightOverview({readState:async id=>id===LIGHT_OVERVIEW_IDS[0]?{data:{entity_id:id,state:'on'}}:id===LIGHT_OVERVIEW_IDS[1]?{data:{entity_id:'light.impersonator',state:'off'}}:{isError:true}});
 assert.equal(r.status,'partial');assert.equal(r.onCount,1);assert.equal(r.offCount,0);assert.equal(r.unknownCount,6);assert.match(r.text,/Требуют проверки/);
});
test('transport faults are bounded to unknown on every requested state',async()=>{
 const r=await summarizeLightOverview({readState:async()=>{throw Error('MCP unavailable')}});
 assert.equal(r.status,'partial');assert.equal(r.unknownCount,7);assert.equal(r.actualWrite,false);
 const noClient=await summarizeLightOverview();assert.equal(noClient.status,'unavailable');
});

test('unavailable entity IDs stay explicitly visible, not counted as physical lights',async()=>{
 const r=await summarizeLightOverview({readState:async id=>({data:{entity_id:id,state:id==='light.koridor_2'?'unavailable':'off'}})});
 assert.equal(r.status,'partial');
 assert.equal(r.unknownCount,1);
 assert.equal(r.offCount,6);
 assert.ok(r.text.includes('light.koridor_2'));
 assert.match(r.text,/не число физических ламп/);
 assert.equal(r.authorization,false);
 assert.equal(r.actualWrite,false);
});
