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

test('focused OFF answer lists only confirmed OFF states, not the full overview',async()=>{
 const seen=[];
 const r=await summarizeLightOverview({mode:'off',readState:async id=>{
  seen.push(id);
  return {data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[0]?'on':'off'}};
 }});
 assert.deepEqual(seen,LIGHT_OVERVIEW_IDS);
 assert.equal(r.status,'complete');
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 assert.match(r.text,/Выключены: Коридор, Коридор, первый этаж, Коридор, споты/);
 assert.doesNotMatch(r.text,/Включены: Тамбур|on 1/);
 assert.match(r.text,/только 4 выбранные сущности HA, не весь дом/);
});
test('focused OFF answer exposes unknown states instead of treating them as off',async()=>{
 const r=await summarizeLightOverview({mode:'off',readState:async id=>({data:{entity_id:id,state:id===LIGHT_OVERVIEW_IDS[1]?'off':'unavailable'}})});
 assert.equal(r.status,'partial');assert.equal(r.offCount,1);assert.equal(r.unknownCount,3);
 assert.match(r.text,/Выключены: Коридор\./);
 assert.match(r.text,/Неизвестны: light\.tambur_svet_l1/);
 assert.doesNotMatch(r.text,/Выключены: Тамбур/);
 assert.equal(r.actualWrite,false);assert.equal(r.authorization,false);
});
test('focused all-off answer stays truthful across on, off, and unknown',async()=>{
 const read=state=>summarizeLightOverview({mode:'all_off',readState:async id=>({data:{entity_id:id,state:typeof state==='function'?state(id):state}})});
 const off=await read('off');
 assert.match(off.text,/Да, весь выбранный свет выключен/);
 assert.equal(off.unknownCount,0);
 const on=await read(id=>id===LIGHT_OVERVIEW_IDS[0]?'on':'off');
 assert.match(on.text,/Нет, не весь выбранный свет выключен/);
 assert.match(on.text,/Включены: Тамбур/);
 const unknown=await read(id=>id===LIGHT_OVERVIEW_IDS[2]?'unknown':'off');
 assert.equal(unknown.status,'partial');
 assert.match(unknown.text,/Не могу подтвердить/);
 assert.match(unknown.text,/light\.koridor_1_etazh/);
 assert.doesNotMatch(unknown.text,/Да, весь выбранный свет выключен/);
 const mixed=await read(id=>id===LIGHT_OVERVIEW_IDS[0]?'on':'unavailable');
 assert.match(mixed.text,/Нет, не весь выбранный свет выключен/);
 assert.match(mixed.text,/Неизвестны:/);
 assert.equal(mixed.actualWrite,false);assert.equal(mixed.authorization,false);
});
