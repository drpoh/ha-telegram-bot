import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describeFloorAreaStructure} from '../src/home/ha-floor-area-shape.mjs';
test('counts floors and areas, reveals only structural keys, not values',()=>{
 const data={success:true,floor_count:2,area_count:9,
  floors:[{floor_id:'private_floor',name:'secret household',areas:[{area_id:'sensitive',name:'secret room',labels:['private']}]},
   {floor_id:'second',name:'another secret',areas:[]}],
  unassigned_areas:[{area_id:'private',name:'secret bedroom',labels:[]}],
  orphaned_areas:[]};
 const result=describeFloorAreaStructure(data);
 assert.equal(result.status,'structure_only');
 assert.equal(result.counts.reportedFloors,2);
 assert.equal(result.counts.reportedAreas,9);
 assert.equal(result.counts.unassigned,1);
 assert.equal(result.noStateReads,true);
 assert.equal(result.noWrites,true);
 assert.deepEqual(result.samples[0].fields.find(x=>x.key==='areas').itemKeys,['area_id','labels','name']);
 assert.doesNotMatch(JSON.stringify(result),/secret|private_floor|sensitive|another/);
});
test('untrusted shapes fail closed without raw logs',()=>{
 assert.equal(describeFloorAreaStructure({success:false,floors:[],unassigned_areas:[],orphaned_areas:[]}).status,'unavailable');
 assert.equal(describeFloorAreaStructure({success:true,floors:'bad',unassigned_areas:[],orphaned_areas:[]}).status,'unavailable');
 assert.equal(describeFloorAreaStructure(null).status,'unavailable');
});
test('operator utility contains one fixed read and no state or write calls',()=>{
 const code=readFileSync(new URL('../scripts/manual/v3-ha-floor-area-structure.mjs',import.meta.url),'utf8');
 assert.equal((code.match(/client\.callTool\(/g)||[]).length,1);
 assert.match(code,/name:'ha_list_floors_areas',arguments:\{\}/);
 assert.doesNotMatch(code,/ha_call_service|bot\.launch\(|systemctl/);
});
