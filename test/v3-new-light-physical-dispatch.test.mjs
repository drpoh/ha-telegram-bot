import test from 'node:test';
import assert from 'node:assert/strict';
import {createNewLightDispatch} from '../src/home/new-light-physical-dispatch.mjs';
const id='light.kukhnia_svet',action={name:'ha_call_service',args:{domain:'light',entity_id:id,service:'turn_on'}};
test('no physical call unless independent release, selected entity and trusted admission',async()=>{
 let count=0;
 const callTool=async()=>{count++;return {data:{entity_id:id,state:'on'}};};
 const options={callTool,approvedIds:[id],verifyAdmission:async()=>({valid:true})};
 assert.equal((await createNewLightDispatch(options).dispatch({action})).status,'denied');
 assert.equal((await createNewLightDispatch({...options,releaseEnabled:true,approvedIds:[]}).dispatch({action})).status,'denied');
 assert.equal((await createNewLightDispatch({...options,releaseEnabled:true,verifyAdmission:async()=>({valid:false})}).dispatch({action})).status,'denied');
 assert.equal(count,0);
});
test('valid approved light executes once and verifies by HA state',async()=>{
 const calls=[];
 const result=await createNewLightDispatch({releaseEnabled:true,approvedIds:[id],
  verifyAdmission:async()=>({valid:true}),
  callTool:async(name,args)=>{calls.push([name,args]);return name==='ha_get_state'?{data:{entity_id:id,state:'on'}}:{isError:false};}
 }).dispatch({action});
 assert.equal(result.status,'verified');assert.equal(result.actualWrite,true);
 assert.deepEqual(calls.map(x=>x[0]),['ha_get_state','ha_call_service','ha_get_state']);
});
test('reject Browser Mod, unavailable IDs, extra parameters and unverified state',async()=>{
 let writes=0;
 const dispatcher=createNewLightDispatch({releaseEnabled:true,approvedIds:[id],verifyAdmission:async()=>({valid:true}),
  callTool:async name=>{if(name==='ha_call_service')writes++;return {data:{entity_id:id,state:'unavailable'}};}});
 for(const bad of ['light.browser_mod_panel','light.liustra','light.spalnia']){
  assert.equal((await dispatcher.dispatch({action:{...action,args:{...action.args,entity_id:bad}}})).status,'denied');
 }
 assert.equal((await dispatcher.dispatch({action:{...action,args:{...action.args,brightness:100}}})).status,'denied');
 assert.equal((await dispatcher.dispatch({action})).reason,'preflight_unverified');
 assert.equal(writes,0);
});
