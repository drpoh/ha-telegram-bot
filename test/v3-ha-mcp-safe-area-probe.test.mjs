import test from 'node:test';
import assert from 'node:assert/strict';
import {approveAreaList,summarizeAreaReply} from '../src/home/ha-mcp-safe-area-probe.mjs';
test('only exact area tool with no required arguments is eligible',()=>{
 assert.equal(approveAreaList({name:'ha_list_floors_areas',inputSchema:{type:'object',properties:{}}}),true);
 assert.equal(approveAreaList({name:'ha_list_floors_areas',inputSchema:{type:'object',required:['area_id']}}),false);
 assert.equal(approveAreaList({name:'ha_call_service',inputSchema:{type:'object'}}),false);
 assert.equal(approveAreaList({name:'ha_list_floors_areas',inputSchema:null}),false);
});
test('summarizer never emits private response values',()=>{
 const r=summarizeAreaReply({structuredContent:{areas:[{name:'private room'}],token:'do not log'},content:[{type:'text',text:'secret'}]});
 assert.equal(r.status,'shape_only');
 assert.equal(r.writes,0);
 assert.equal(r.noStatesRead,true);
 assert.doesNotMatch(JSON.stringify(r),/private room|do not log|secret/);
});
