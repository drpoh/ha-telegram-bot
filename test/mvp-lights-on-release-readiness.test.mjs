import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeDiscoveredLights} from '../src/home/discovered-lights-overview.mjs';

const entity=(id,state)=>({entity_id:'light.'+id,domain:'light',state});
const response=entities=>({structuredContent:{success:true,partial:false,entity_has_more:false,entity_next_offset:null,entity_total_matches:entities.length,entities}});

test('Telegram read-only inventory calls only ha_search and never an HA write',async()=>{
 const calls=[];
 const result=await summarizeDiscoveredLights({readTool:async(name,args)=>{
  calls.push({name,args});
  return response([entity('a','on'),entity('b','off')]);
 }});
 assert.equal(result.status,'complete');
 assert.deepEqual(calls.map(c=>c.name),['ha_search']);
 assert.deepEqual(calls[0].args.result_fields,['entity_id','domain','state']);
 assert.equal(result.authorization,false);
 assert.equal(result.actualWrite,false);
});

test('untrusted incomplete or failing inventories never say all lights are off',async()=>{
 const candidates=[
  {structuredContent:{success:true,partial:true,entity_has_more:false,entity_next_offset:null,entity_total_matches:1,entities:[entity('a','off')]}},
  {structuredContent:{success:false,partial:false,entity_has_more:false,entity_next_offset:null,entity_total_matches:1,entities:[entity('a','off')]}},
  {isError:true},
  undefined,
 ];
 for(const item of candidates){
  const result=await summarizeDiscoveredLights({readTool:async()=>item});
  assert.equal(result.status,'unavailable');
  assert.equal(result.authorization,false);
  assert.equal(result.actualWrite,false);
  assert.doesNotMatch(result.text,/Подтверждённых включённых светильников нет/);
 }
});

test('status handles a bounded full inventory without Telegram message overflow',async()=>{
 const entities=Array.from({length:200},(_,i)=>entity('fixture_'+String(i).padStart(3,'0'),'on'));
 const result=await summarizeDiscoveredLights({readTool:async()=>response(entities)});
 assert.equal(result.status,'complete');
 assert.equal(result.checked,200);
 assert.equal(result.on.length,200);
 assert.match(result.text,/ещё 180 \(список сокращён\)/);
 assert.ok(result.text.length<4096);
});
