import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNativeHAAreaCatalog,summarizeAreaCatalogCoverage} from '../src/home/ha-native-area-catalog.mjs';
import {buildHAReadOnlyMetadataIndex} from '../src/home/ha-registry-metadata-index.mjs';
const area=(id,name,floor_id=null,labels=[])=>({area_id:id,name,floor_id,aliases:[],labels});
const fixture=()=>({
 success:true,floor_count:2,area_count:17,unassigned_count:5,orphaned_count:0,
 floors:[
  {floor_id:'first',areas:Array.from({length:5},(_,i)=>area('a'+i,'Комната '+i,'first'))},
  {floor_id:'second',areas:Array.from({length:7},(_,i)=>area('b'+i,'Комната B'+i,'second'))}
 ],
 unassigned_areas:Array.from({length:5},(_,i)=>area('u'+i,'Без этажа '+i)),
 orphaned_areas:[]
});
test('normalize real 2 floor / 17 area / 5 unassigned HA-MCP structure',()=>{
 const raw=fixture();
 raw.floors[0].areas[0].aliases=['Кухня','Кухня',' кухонная зона '];
 raw.floors[0].areas[0].labels=['osveshchenie'];
 const result=buildNativeHAAreaCatalog({structuredContent:raw});
 assert.equal(result.status,'complete_area_metadata');
 assert.equal(result.counts.observedAreas,17);
 assert.equal(result.counts.observedFloors,2);
 assert.equal(result.counts.unassignedAreas,5);
 assert.deepEqual(result.areas[0].aliases,['Кухня','кухонная зона']);
 assert.deepEqual(result.areas[0].area_labels,['osveshchenie']);
 assert.equal(result.complete,true);
 assert.equal(result.authorizesRead,false);
 assert.equal(result.authorizesWrite,false);
 assert.deepEqual(summarizeAreaCatalogCoverage(result),{
  status:'areas_only',floors:2,areas:17,unassigned:5,areaLabelReferences:1,
  entityRegistryComplete:false,deviceRegistryComplete:false,
  labelRegistryComplete:false,authorizesRead:false,authorizesWrite:false
 });
});
test('area metadata adapts to existing HA registry index without assigning entity labels',()=>{
 const cat=buildNativeHAAreaCatalog(fixture());
 const index=buildHAReadOnlyMetadataIndex({
  areas:cat.areas,devices:[],entities:[{entity_id:'light.x',area_id:'a0'}],labels:[]
 });
 assert.equal(index[0].areaName,'Комната 0');
 assert.equal(index[0].category,'unclassified');
 assert.equal(index[0].visibleInRoom,false);
});
test('unknown, contradictory, duplicate and incomplete registry snapshots fail closed',()=>{
 const cases=[];
 let a=fixture();a.area_count=18;cases.push(a);
 a=fixture();a.orphaned_areas=[area('z','bad')];cases.push(a);
 a=fixture();a.floors[0].areas[0].floor_id='second';cases.push(a);
 a=fixture();a.unassigned_areas[0].floor_id='first';cases.push(a);
 a=fixture();a.floors[1].areas[0].area_id='a0';cases.push(a);
 a=fixture();a.floors[0].areas=null;cases.push(a);
 a=fixture();a.floors[0].areas[0].name='';cases.push(a);
 for(const raw of cases){
  const result=buildNativeHAAreaCatalog(raw);
  assert.equal(result.status,'unverified');
  assert.equal(result.authorizesRead,false);
  assert.equal(result.authorizesWrite,false);
 }
 assert.equal(buildNativeHAAreaCatalog({isError:true,structuredContent:fixture()}).status,'unverified');
});
