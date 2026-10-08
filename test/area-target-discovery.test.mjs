import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverAreaTargets } from '../src/decision/area-target-discovery.mjs';
const areaId='bath',areaName='Ванная и Сауна';
function fixture({ unavailable=false, wrongArea=false, partial=false, extraSwitch=false }={}) {
 const calls=[];
 const callTool=async(name,args)=>{
  calls.push({name,args});
  if(name==='ha_search') {
   const entities=args.domain_filter==='light'
     ? [{entity_id:'light.wled',domain:'light',area:wrongArea?'Кухня':areaName}]
     : [{entity_id:'switch.vannaia_svet',domain:'switch',area:areaName},
       ...(extraSwitch?[{entity_id:'switch.freeze',domain:'switch',area:areaName}]:[])];
   return {structuredContent:{success:true,partial,entity_has_more:false,entity_total_matches:entities.length,entities}};
  }
  return {structuredContent:{data:{entity_id:args.entity_id,state:unavailable?'unavailable':'off'}}};
 };
 return {calls,callTool};
}
test('specific switch and light validated, other switches omitted',async()=>{
 const f=fixture({extraSwitch:true});
 const r=await discoverAreaTargets({areaId,areaName,callTool:f.callTool,lightIds:['light.wled'],switchLightIds:['switch.vannaia_svet']});
 assert.equal(r.allowed,true);
 assert.deepEqual(r.entityIds,['light.wled','switch.vannaia_svet']);
 assert.equal(f.calls.some(c=>c.args.entity_id==='switch.freeze'),false);
 assert.equal(f.calls.some(c=>c.name==='ha_call_service'),false);
});
test('unavailable blocks all without silent partial command',async()=>{
 const r=await discoverAreaTargets({areaId,areaName,callTool:fixture({unavailable:true}).callTool,lightIds:['light.wled'],switchLightIds:['switch.vannaia_svet']});
 assert.equal(r.status,'unavailable_targets'); assert.equal(r.allowed,false);
});
test('cross area member blocks',async()=>assert.equal((await discoverAreaTargets({areaId,areaName,callTool:fixture({wrongArea:true}).callTool,lightIds:['light.wled']})).status,'area_membership_unverified'));
test('partial inventory blocks',async()=>assert.equal((await discoverAreaTargets({areaId,areaName,callTool:fixture({partial:true}).callTool,lightIds:['light.wled']})).status,'incomplete_area_inventory'));
test('unapproved switch cannot be admitted',async()=>assert.equal((await discoverAreaTargets({areaId,areaName,callTool:fixture().callTool,lightIds:['light.wled'],switchLightIds:['switch.other']})).status,'switch_not_in_area'));
test('invalid inputs fail closed',async()=>assert.equal((await discoverAreaTargets({areaId,areaName,callTool:fixture().callTool,lightIds:['light.wled'],switchLightIds:['light.wled']})).allowed,false));

test('unclassified lights block the whole request',async()=>{
 const f=fixture();
 const r=await discoverAreaTargets({areaId,areaName,callTool:f.callTool,switchLightIds:['switch.vannaia_svet']});
 assert.equal(r.status,'unclassified_lights'); assert.equal(r.allowed,false);
 assert.equal(f.calls.some(c=>c.name==='ha_get_state'),false);
});
test('explicitly excluded status LED is never selected',async()=>{
 const f=fixture();
 const r=await discoverAreaTargets({areaId,areaName,callTool:f.callTool,lightIds:[],excludedLightIds:['light.wled'],switchLightIds:['switch.vannaia_svet']});
 assert.deepEqual(r.entityIds,['switch.vannaia_svet']);
 assert.equal(f.calls.filter(c=>c.name==='ha_get_state').length,1);
});
test('classification overlap fails closed',async()=>{
 const r=await discoverAreaTargets({areaId,areaName,callTool:fixture().callTool,lightIds:['light.wled'],excludedLightIds:['light.wled']});
 assert.equal(r.status,'invalid_discovery_request');
});
