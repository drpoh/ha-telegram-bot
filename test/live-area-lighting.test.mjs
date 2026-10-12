import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {verifyLiveAreaLighting as verify} from '../src/decision/live-area-lighting.mjs';
async function withMap(doc,fn){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'area-check-'));
 try{
  const configPath=path.join(dir,'light.json');
  await fs.writeFile(configPath,JSON.stringify(doc));
  return await fn(configPath);
 }finally{await fs.rm(dir,{recursive:true,force:true})}
}
const map={version:1,areas:[{area_id:'sauna',area_name:'Ванная и Сауна',
 light_ids:['light.wled'],excluded_light_ids:['light.status'],switch_light_ids:['switch.vannaia_svet']}]};
function mock({extra=false,unavailable=false,partial=false}={}){
 const calls=[];
 const callTool=async(name,args)=>{
  calls.push({name,args});
  if(name==='ha_list_floors_areas')return {structuredContent:{success:true,floors:[{areas:[{area_id:'sauna',name:'Ванная и Сауна'}]}],unassigned_areas:[]}};
  if(name==='ha_search'){
   const entities=args.domain_filter==='light'?
    [{entity_id:'light.wled',domain:'light',area:'Ванная и Сауна'},{entity_id:'light.status',domain:'light',area:'Ванная и Сауна'},...(extra?[{entity_id:'light.new',domain:'light',area:'Ванная и Сауна'}]:[])]:
    [{entity_id:'switch.vannaia_svet',domain:'switch',area:'Ванная и Сауна'}];
   return {structuredContent:{success:true,partial,entity_has_more:false,entity_total_matches:entities.length,entities}};
  }
  if(name==='ha_get_state')return {structuredContent:{data:{entity_id:args.entity_id,state:unavailable?'unavailable':'off'}}};
  throw Error('Unexpected or actuating tool');
 };
 return {calls,callTool};
}
test('complete read-only chain verifies target and excludes indicator',async()=>{
 await withMap(map,async configPath=>{
  const m=mock(); const result=await verify({areaQuery:'Ванная и Сауна',configPath,callTool:m.callTool});
  assert.deepEqual(result.entityIds,['light.wled','switch.vannaia_svet']);
  assert.equal(m.calls.some(x=>x.name==='ha_call_service'),false);
  assert.equal(m.calls.some(x=>x.args?.entity_id==='light.status'),false);
 });
});
test('partial name cannot expand shared area',async()=>{
 await withMap(map,async configPath=>{
  const m=mock();const r=await verify({areaQuery:'Ванная',configPath,callTool:m.callTool});
  assert.equal(r.allowed,false);assert.deepEqual(m.calls.map(x=>x.name),['ha_list_floors_areas']);
 });
});
test('missing reviewed map fails closed',async()=>{
 const m=mock();const r=await verify({areaQuery:'Ванная и Сауна',configPath:'/definitely/no/file',callTool:m.callTool});
 assert.equal(r.allowed,false);assert.equal(m.calls.some(x=>x.name==='ha_search'),false);
});
test('new unclassified light blocks whole action',async()=>{
 await withMap(map,async configPath=>assert.equal((await verify({areaQuery:'Ванная и Сауна',configPath,callTool:mock({extra:true}).callTool})).status,'unclassified_lights'));
});
test('unavailable selected light blocks entire scope',async()=>{
 await withMap(map,async configPath=>assert.equal((await verify({areaQuery:'Ванная и Сауна',configPath,callTool:mock({unavailable:true}).callTool})).status,'unavailable_targets'));
});
test('partial inventory blocks',async()=>{
 await withMap(map,async configPath=>assert.equal((await verify({areaQuery:'Ванная и Сауна',configPath,callTool:mock({partial:true}).callTool})).allowed,false));
});
