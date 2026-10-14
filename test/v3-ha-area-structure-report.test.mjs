import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarizeHAAreaStructure} from '../src/home/ha-area-structure-report.mjs';

const fixture={structuredContent:{success:true,floor_count:2,area_count:8,
 unassigned_count:2,orphaned_count:0,
 floors:[{floor_id:'private_id',name:'Private First Floor',
  areas:[{area_id:'secret_id',name:'My Bedroom',labels:['very-private']}]},
  {floor_id:'private2',name:'Private Floor 2',areas:[]}],
 unassigned_areas:[{area_id:'secret3',name:'Private Room'}],orphaned_areas:[]}};
test('area report includes only counts and nested field names/types, never owner values',()=>{
 const report=summarizeHAAreaStructure(fixture);
 assert.equal(report.status,'shape_only');
 assert.equal(report.floorCount,2);
 assert.equal(report.areaCount,8);
 assert.equal(report.unassignedCount,2);
 assert.equal(report.floors.type,'array');
 assert.equal(report.floors.sample.type,'object');
 assert.equal(report.floors.sample.fields.areas.type,'array');
 assert.equal(report.floors.sample.fields.areas.sample.type,'object');
 assert.match(JSON.stringify(report),/area_id/);
 assert.doesNotMatch(JSON.stringify(report),/Private|My Bedroom|private_id|secret_id|secret3|very-private/);
 assert.equal(report.permitsWrites,false);
 assert.equal(report.fullRegistryVerified,false);
});
test('no partial or malformed HA response accepted as complete area inventory',()=>{
 assert.equal(summarizeHAAreaStructure(null).status,'unavailable');
 assert.equal(summarizeHAAreaStructure({isError:true,...fixture}).status,'unavailable');
 assert.equal(summarizeHAAreaStructure({structuredContent:{success:false,floors:[],unassigned_areas:[],orphaned_areas:[]}}).status,'unavailable');
 assert.equal(summarizeHAAreaStructure({structuredContent:{success:true,floors:[],orphaned_areas:[]}}).status,'unavailable');
});
test('operator audit makes precisely one fixed read-only tool call; never starts Telegram',()=>{
 const script=readFileSync(new URL('../scripts/manual/v3-ha-area-structure-audit.mjs',import.meta.url),'utf8');
 assert.equal((script.match(/client\.callTool\(/g)||[]).length,1);
 assert.match(script,/name:'ha_list_floors_areas',arguments:\{\}/);
 assert.doesNotMatch(script,/bot\.launch\(|ha_call_service|systemctl|\.dispatch\(/);
 assert.match(script,/PRODUCTION_CHANGED=NO/);
});
