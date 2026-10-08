import test from 'node:test';
import assert from 'node:assert/strict';
import {isBathroomLightRequest,checkBathroomLightAction} from '../src/decision/bathroom-light-guard.mjs';

const target = {domain:'switch',service:'turn_off',entity_id:'switch.vannaia_svet'};
function mock({ state='off', area='Ванная и Сауна', missing=false }={}) {
 const calls=[];
 const callTool=async (name,args)=>{
   calls.push({name,args});
   if(name==='ha_search') return {structuredContent:{
     success:true,partial:false,entity_has_more:false,entity_total_matches:1,
     entities:[{entity_id:missing?'switch.other':'switch.vannaia_svet',domain:'switch',area}]
   }};
   return {structuredContent:{data:{entity_id:args.entity_id,state}}};
 };
 return {calls,callTool};
}
test('explicit bathroom light recognized',()=>assert.equal(isBathroomLightRequest('Выключи свет в ванной'),true));
test('sauna and full room excluded',()=>{
 for(const s of ['Выключи весь свет в ванной','Выключи свет в сауне','Выключи свет в ванной и подсветку','Выключи всё в ванной'])
 assert.equal(isBathroomLightRequest(s),false,s);
});
test('correct bathroom target is verified with read calls only', async()=>{
 const m=mock();
 const result=await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_call_service',args:target,callTool:m.callTool});
 assert.deepEqual(result,{allowed:true,status:'verified',entityIds:['switch.vannaia_svet']});
 assert.deepEqual(m.calls.map(c=>c.name),['ha_search','ha_get_state']);
});
test('other device denied before reads',async()=>{
 const m=mock();
 const r=await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_call_service',args:{...target,entity_id:'switch.wled_gledopto_freeze'},callTool:m.callTool});
 assert.equal(r.allowed,false); assert.equal(m.calls.length,0);
});
test('unavailable denied',async()=>assert.equal((await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_call_service',args:target,callTool:mock({state:'unavailable'}).callTool})).allowed,false));
test('wrong area denied',async()=>assert.equal((await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_call_service',args:target,callTool:mock({area:'Кухня'}).callTool})).allowed,false));
test('missing device denied',async()=>assert.equal((await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_call_service',args:target,callTool:mock({missing:true}).callTool})).allowed,false));
test('read-only tools unchanged',async()=>assert.equal((await checkBathroomLightAction({userText:'Выключи свет в ванной',toolName:'ha_get_state',args:target,callTool:mock().callTool})).status,'not_applicable'));
