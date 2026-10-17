import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVerifiedLightScene as apply} from '../src/scenes/verified-run.mjs';
const s={entities:[{entity_id:'light.a',state:'on',attributes:{brightness:90}}]};
test('applies light with verified readback',async()=>{
 const calls=[];
 const r=await apply(s,async(name,args)=>{calls.push([name,args]);return name==='ha_get_state'?{structuredContent:{data:{entity_id:'light.a',state:'on',attributes:{brightness:90}}}}:{structuredContent:{success:true}}});
 assert.deepEqual(r,{success:true,confirmed:1,entities:1});
 assert.equal(calls[0][1].brightness,90);
 assert.equal(calls[1][0],'ha_get_state');
});
test('reject unsupported scene before any HA calls',async()=>{
 let n=0;
 const r=await apply({entities:[...s.entities,{entity_id:'switch.heat',state:'on'}]},async()=>{n++;});
 assert.equal(r.blocked,true);assert.equal(n,0);
});
test('fail on service refusal or unverified state',async()=>{
 assert.equal((await apply(s,async()=>({isError:true}))).success,false);
 assert.equal((await apply(s,async(name)=>name==='ha_get_state'?{structuredContent:{data:{entity_id:'light.a',state:'off'}}}:{structuredContent:{success:true}})).outcome,'state_unverified');
});
test('reports confirmed partial completion on failure',async()=>{
 const scene={entities:[{entity_id:'light.a',state:'on'},{entity_id:'light.b',state:'off'}]};
 const r=await apply(scene,async(name,args)=>name==='ha_get_state'?{structuredContent:{data:{entity_id:args.entity_id,state:'on'}}}:{structuredContent:{success:true}});
 assert.equal(r.partial,true);assert.equal(r.confirmed,1);assert.equal(r.success,false);
});
