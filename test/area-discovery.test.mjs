import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverAreaLights } from '../src/decision/area-discovery.mjs';
const entities = [{entity_id:'light.a',domain:'light',area:'living_room'},{entity_id:'light.b',domain:'light',area:'living_room'}];
function mock({truncated=false, wrongArea=false, unavailable=false, error=false}={}) {
  const calls=[];
  const callTool=async(name,args)=>{
    calls.push({name,args});
    if(error) throw new Error('offline');
    if(name==='ha_search') return {structuredContent:{success:true,partial:false,entity_has_more:truncated,entity_total_matches:2,entities:wrongArea?[entities[0],{...entities[1],area:'kitchen'}]:entities}};
    return {structuredContent:{data:{entity_id:args.entity_id,state:unavailable?'unavailable':'on'}}};
  };
  return {calls,callTool};
}
test('read-only complete discovery validates',async()=>{
  const {calls,callTool}=mock();
  const result=await discoverAreaLights({areaId:'living_room',callTool});
  assert.equal(result.allowed,true);
  assert.deepEqual(result.entityIds,['light.a','light.b']);
  assert.deepEqual(calls.map(c=>c.name),['ha_search','ha_get_state','ha_get_state']);
  assert.equal(calls[0].args.area_filter,'living_room');
});
test('truncated inventory blocks before state reads',async()=>{
  const {calls,callTool}=mock({truncated:true});
  assert.equal((await discoverAreaLights({areaId:'living_room',callTool})).allowed,false);
  assert.equal(calls.length,1);
});
test('wrong area fails closed',async()=>assert.equal((await discoverAreaLights({areaId:'living_room',callTool:mock({wrongArea:true}).callTool})).allowed,false));
test('unavailable state fails closed',async()=>assert.equal((await discoverAreaLights({areaId:'living_room',callTool:mock({unavailable:true}).callTool})).allowed,false));
test('MCP failure fails closed',async()=>assert.equal((await discoverAreaLights({areaId:'living_room',callTool:mock({error:true}).callTool})).status,'discovery_failed'));
