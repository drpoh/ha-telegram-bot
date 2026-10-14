import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {countAreaDevices,inspectDevicePage,inspectDeviceListAdmission} from '../src/home/ha-all-area-device-census.mjs';
const areaResponse={structuredContent:{
 success:true,floor_count:1,area_count:2,unassigned_count:1,orphaned_count:0,
 floors:[{floor_id:'floor1',areas:[{area_id:'room1',name:'One',floor_id:'floor1',labels:[]}]}],
 unassigned_areas:[{area_id:'room2',name:'Two',floor_id:null,labels:[]}],orphaned_areas:[]
}};
const manifest=[{name:'ha_get_device',inputSchema:{type:'object',properties:{
 area_id:{anyOf:[{type:'string'},{type:'null'}]},
 limit:{type:'integer'},offset:{type:'integer'}
}}}];
const id=i=>i.toString(16).padStart(32,'0');
const makePage=(area,offset,limit,count,total,more)=>({structuredContent:{
 success:true,area_filter:area,total_count:total,total_devices:total,
 offset,limit,count,has_more:more,next_offset:more?offset+count:null,
 devices:Array.from({length:count},(_,i)=>({device_id:id(offset+i+1),area_id:area}))
}});
test('reuses native 2-zone registry and paginates without inventing HA permissions',async()=>{
 const called=[];
 const census=await countAreaDevices({
  areaResponse,manifest,
  readPage:async args=>{
   called.push(args);
   const total=args.area_id==='room1'?61:4;
   const count=Math.min(args.limit,total-args.offset);
   return makePage(args.area_id,args.offset,args.limit,count,total,args.offset+count<total);
  }
 });
 assert.equal(census.status,'area_device_census_complete');
 assert.equal(census.areasChecked,2);
 assert.equal(census.areaDeviceRecords,65);
 assert.equal(census.calls,3);
 assert.deepEqual(census.byArea.map(x=>x.devices),[61,4]);
 assert.deepEqual(called.map(x=>x.offset),[0,50,0]);
 assert.equal(census.deviceRegistryComplete,false);
 assert.equal(census.authorizesRead,false);
 assert.equal(census.authorizesWrite,false);
});
test('rejects duplicate device records and inconsistent pages',async()=>{
 const correct=makePage('room1',0,50,2,2,false);
 assert.equal(inspectDevicePage(correct,{areaId:'room1',offset:0,limit:50}).valid,true);
 const dup=structuredClone(correct);
 dup.structuredContent.devices[1].device_id=dup.structuredContent.devices[0].device_id;
 assert.equal(inspectDevicePage(dup,{areaId:'room1',offset:0,limit:50}).valid,false);
 const wrong=structuredClone(correct);
 wrong.structuredContent.area_filter='room2';
 assert.equal(inspectDevicePage(wrong,{areaId:'room1',offset:0,limit:50}).valid,false);
 const neverEnd=makePage('room1',0,50,0,50,true);
 assert.equal(inspectDevicePage(neverEnd,{areaId:'room1',offset:0,limit:50}).valid,false);
});
test('fail closed if area metadata or MCP argument schema is not trustworthy',async()=>{
 assert.equal(inspectDeviceListAdmission([]),false);
 assert.equal(inspectDeviceListAdmission([{name:'ha_call_service',inputSchema:{type:'object'}}]),false);
 assert.equal((await countAreaDevices({manifest,areaResponse:{structuredContent:{success:false}},readPage:async()=>{}})).status,'unverified');
 assert.equal((await countAreaDevices({manifest,areaResponse,readPage:async()=>{throw Error('private')}})).status,'partial');
});
test('operator script is read-only and does not expose names and IDs in output',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-ha-all-area-device-census.mjs',import.meta.url),'utf8');
 assert.match(src,/name:'ha_list_floors_areas',arguments:\{\}/);
 assert.match(src,/name:'ha_get_device',arguments:args/);
 assert.doesNotMatch(src,/ha_call_service|bot\.launch\(|systemctl|console\.log\(raw\)/);
});
