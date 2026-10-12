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

test('Russian light status includes reviewed off labels without inventing physical fixtures',async()=>{
 const r=await summarizeLightOverview({readState:async id=>({data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[0]?'on':'off'}})});
 assert.equal(r.status,'complete');assert.equal(r.onCount,1);assert.equal(r.offCount,3);
 assert.match(r.text,/В состоянии on: Тамбур/);
 assert.match(r.text,/В состоянии off: Коридор, Коридор, первый этаж, Коридор, споты/);
 assert.match(r.text,/не число физических ламп/);
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});

test('All-off conclusion stays bounded and unknown never implies all off',async()=>{
 const fixture=async state=>summarizeLightOverview({readState:async id=>({data:{entity_id:id,state:typeof state==='function'?state(id):state}})});
 const off=await fixture('off');assert.match(off.text,/Весь выбранный свет выключен/);assert.equal(off.onCount,0);
 const on=await fixture(id=>id===LIGHT_OVERVIEW_IDS[0]?'on':'off');assert.match(on.text,/Не весь выбранный свет выключен/);
 const partial=await fixture(id=>id===LIGHT_OVERVIEW_IDS[0]?'unavailable':'off');assert.match(partial.text,/нельзя достоверно сказать/);assert.doesNotMatch(partial.text,/\. Весь выбранный свет выключен\./);
 assert.equal(partial.actualWrite,false);assert.equal(partial.authorization,false);
});

test('Concise Russian OFF-only answer returns names of OFF entities without full overview summary',async()=>{
 const r=await summarizeLightOverview({
  readState:async id=>({data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[0]?'on':'off'}}),
  mode:'off_only'
 });
 assert.equal(r.status,'complete');
 assert.equal(r.text,'Выключенный выбранный свет: Коридор, Коридор, первый этаж, Коридор, споты.');
 assert.doesNotMatch(r.text,/Освещение \(состояния 4 выбранных сущностей HA/);

 const allOn=await summarizeLightOverview({
  readState:async id=>({data:{entity_id:id,state:'on'}}),
  mode:'off_only'
 });
 assert.equal(allOn.text,'Среди 4 выбранных сущностей HA выключенного света нет.');
});

test('Concise Russian all-off check handles all four OFF, any ON, and unknown/unavailable truthfully',async()=>{
 const fixture=async (state,mode='all_off_check')=>summarizeLightOverview({
  readState:async id=>({data:{entity_id:id,state:typeof state==='function'?state(id):state}}),
  mode
 });

 // All four OFF
 const allOff=await fixture('off');
 assert.equal(allOff.text,'Да, весь выбранный свет выключен (4 из 4 сущностей HA).');

 // Any ON
 const oneOn=await fixture(id=>id===LIGHT_OVERVIEW_IDS[0]?'on':'off');
 assert.equal(oneOn.text,'Нет, не весь выбранный свет выключен. В состоянии on: Тамбур.');

 // Unknown/unavailable (no ON)
 const unknownOne=await fixture(id=>id===LIGHT_OVERVIEW_IDS[3]?'unavailable':'off');
 assert.equal(unknownOne.text,'Нельзя достоверно сказать: не все состояния 4 выбранных сущностей HA известны. Требуют проверки: light.koridor_spot.');
});
