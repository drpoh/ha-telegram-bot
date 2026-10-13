import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarizeDiscoveredLights} from '../src/home/discovered-lights-overview.mjs';

const response=(entities)=>({structuredContent:{
 success:true,partial:false,entity_has_more:false,entity_next_offset:null,
 entity_total_matches:entities.length,entities
}});
const e=(name,state)=>({entity_id:'light.'+name,domain:'light',state});

test('all-light diagnostic requests hidden plus visible entities in one scoped HA search',async()=>{
 const calls=[];
 const r=await summarizeDiscoveredLights({
  includeHidden:true,maxEntities:500,
  readTool:async(name,args)=>{calls.push({name,args});return response([
   e('visible','on'),e('hidden','off'),e('unpowered','unavailable'),e('uncertain','unknown'),e('strange','standby')
  ]);}
 });
 assert.deepEqual(calls.map(c=>c.name),['ha_search']);
 assert.deepEqual(calls[0].args,{
  query:'',domain_filter:'light',limit:500,include_hidden:true,
  result_fields:['entity_id','domain','state']
 });
 assert.equal(r.status,'partial');assert.equal(r.checked,5);
 assert.deepEqual(r.on,['light.visible']);assert.deepEqual(r.off,['light.hidden']);
 assert.deepEqual(r.unknown,['light.unpowered','light.uncertain','light.strange']);
 assert.deepEqual(r.unknownDetails,[
  {id:'light.unpowered',reason:'unavailable'},
  {id:'light.uncertain',reason:'unknown'},
  {id:'light.strange',reason:'other_state'}
 ]);
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
});
test('prefix-based Browser Mod buckets are only diagnostic and do not authorize any device',async()=>{
 const r=await summarizeDiscoveredLights({includeHidden:true,maxEntities:500,readTool:async()=>response([
  e('browser_mod_a_screen','unavailable'),
  e('browser_mod_b_screen','unknown'),
  e('kitchen','on'),
  e('other','off'),
  e('broken','unavailable')
 ])});
 assert.equal(r.checked,5);assert.equal(r.status,'partial');
 assert.deepEqual(r.reviewBuckets,{
  browserModPrefix:2,otherEntityIds:3,
  unknownBrowserModPrefix:2,unknownOtherEntityIds:1
 });
 assert.equal(r.authorization,false);assert.equal(r.actualWrite,false);
 // A non-browser_mod ID is NOT automatically a verified physical fixture.
 assert.ok(r.reviewBuckets.otherEntityIds>=1);
});
test('an incomplete full-domain inventory is denied, never treated as all lights',async()=>{
 const all=[e('one','off'),e('two','on')];
 for(const patch of [
  {entity_has_more:true,entity_next_offset:2},
  {partial:true},
  {entity_total_matches:3},
  {success:false}
 ]){
  const r=await summarizeDiscoveredLights({maxEntities:500,includeHidden:true,
   readTool:async()=>({structuredContent:{...response(all).structuredContent,...patch}})});
  assert.equal(r.status,'unavailable');assert.equal(r.actualWrite,false);
 }
});
test('reject invalid includeHidden parameter before HA access',async()=>{
 let calls=0;
 const r=await summarizeDiscoveredLights({includeHidden:'true',readTool:async()=>{
  calls++;return response([e('one','off')]);
 }});
 assert.equal(r.status,'unavailable');assert.equal(calls,0);
});
test('all-light manual script has explicit operator guard, fixed HA search and no actuation',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-all-lights-readonly-inventory.mjs',import.meta.url),'utf8');
 assert.match(src,/--readonly --operator-approved/);
 assert.match(src,/summarizeDiscoveredLights\(/);
 assert.match(src,/includeHidden:true/);
 assert.match(src,/maxEntities:500/);
 assert.match(src,/name!=='ha_search'/);
 assert.match(src,/ALL_LIGHTS_WRITE_AUTHORIZATION=false/);
 assert.match(src,/ALL_LIGHTS_REVIEW_BUCKETS=/);
 assert.match(src,/ALL_LIGHTS_INVENTORY=unverified_or_incomplete/);
 assert.doesNotMatch(src,/ha_call_service|turn_on|turn_off|new Telegraf|bot\.launch|setInterval|createWriteStream/);
});
