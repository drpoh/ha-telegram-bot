import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverSceneAreaEntities} from '../src/scenes/area-membership.mjs';
const ok=(entities=[],more=false)=>({structuredContent:{success:true,entities,entity_has_more:more}});
test('fresh complete room lookup returns only scoped entities',async()=>{
 const r=await discoverSceneAreaEntities('living',async(name,args)=>{
  assert.equal(name,'ha_search');
  assert.equal(args.area_filter,'living');
  return ok(args.domain_filter==='light'?[{entity_id:'light.a',domain:'light',area_id:'living'}]:[]);
 });
 assert.deepEqual(r,{allowed:true,status:'verified_area_membership',ids:['light.a']});
});
test('does not authorize truncated or errored inventory',async()=>{
 assert.equal((await discoverSceneAreaEntities('living',async()=>ok([],true))).allowed,false);
 assert.equal((await discoverSceneAreaEntities('living',async()=>({isError:true}))).allowed,false);
 assert.equal((await discoverSceneAreaEntities('living',async()=>{throw Error('unreachable')})).allowed,false);
});
test('cross-area and cross-domain contamination rejected',async()=>{
 assert.equal((await discoverSceneAreaEntities('living',async()=>ok([{entity_id:'light.other',area_id:'kitchen'}]))).allowed,false);
 assert.equal((await discoverSceneAreaEntities('living',async()=>ok([{entity_id:'lock.door'}]))).allowed,false);
});
