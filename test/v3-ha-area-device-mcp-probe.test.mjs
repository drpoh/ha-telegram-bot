import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {admitAreaDeviceProbe,summarizeAreaDeviceProbe} from '../src/home/ha-area-device-mcp-probe.mjs';
const areaResponse={structuredContent:{
 success:true,floor_count:1,area_count:2,unassigned_count:1,orphaned_count:0,
 floors:[{floor_id:'first',areas:[{area_id:'kitchen',name:'Кухня',floor_id:'first',labels:[] }]}],
 unassigned_areas:[{area_id:'sauna',name:'Сауна',floor_id:null,labels:[]}],orphaned_areas:[]
}};
const manifest=[{name:'ha_get_device',inputSchema:{type:'object',properties:{
 area_id:{anyOf:[{type:'string'},{type:'null'}]},device_id:{anyOf:[{type:'string'},{type:'null'}]}
 }}}];
test('one native area is admitted but no other HA authority is granted',()=>{
 const r=admitAreaDeviceProbe({manifest,areaResponse});
 assert.equal(r.allowed,true);
 assert.deepEqual(r.args,{area_id:'kitchen'});
 assert.equal(r.scope,'one_native_area');
 assert.equal(r.authorizesRead,false);
 assert.equal(r.authorizesWrite,false);
 assert.equal(r.haWrites,false);
});
test('fail closed for missing or misleading area/device schemas',()=>{
 for(const trial of [
  {manifest:[],areaResponse},
  {manifest:[...manifest,...manifest],areaResponse},
  {manifest:[{name:'ha_get_device',inputSchema:{type:'object',properties:{area_id:{type:'integer'}}}}],areaResponse},
  {manifest:[{name:'ha_get_device',inputSchema:{type:'object',properties:{area_id:{anyOf:[{type:'string'}]}},required:['secret']}}],areaResponse},
  {manifest,areaResponse:{structuredContent:{...areaResponse.structuredContent,area_count:99}}}
 ]) assert.equal(admitAreaDeviceProbe(trial).allowed,false);
});
test('device shape summarizes keys only, never leaks sensitive device metadata',()=>{
 const r=summarizeAreaDeviceProbe({structuredContent:{
  success:true,devices:[{name:'Private owner',device_id:'dev_secret',token:'a private token'}],
  total:1,metadata:{secret:'hidden'}}});
 assert.equal(r.status,'shape_only');
 assert.equal(r.authorizesWrite,false);
 assert.doesNotMatch(JSON.stringify(r),/Private owner|dev_secret|a private token|hidden/);
 assert.deepEqual(r.fields.find(f=>f.key==='devices').recordKeys,['device_id','name','token']);
});
test('operator script calls only exact 2 read tools and no Telegram poller',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-ha-one-area-device-probe.mjs',import.meta.url),'utf8');
 assert.equal((src.match(/client\.callTool\(/g)||[]).length,2);
 assert.match(src,/name:'ha_list_floors_areas',arguments:\{\}/);
 assert.match(src,/arguments:admission.args/);
 assert.doesNotMatch(src,/ha_call_service|bot\.launch\(|systemctl/);
});
