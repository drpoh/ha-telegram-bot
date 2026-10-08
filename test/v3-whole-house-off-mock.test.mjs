import test from "node:test";
import assert from "node:assert/strict";
import {createV3WholeHouseOffMock} from "../src/decision/v3-whole-house-off-mock.mjs";
const members=Array.from({length:14},(_,i)=>"light.fixture_"+i);
const actor={userId:55,chatId:66};
test("whole house off targets exact Home Assistant group only once",async()=>{
 let writes=0;
 const mock=createV3WholeHouseOffMock({reviewedMembers:members,
  readGroup:async()=>({entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:members}}),
  simulateWrite:async(name,args)=>{
   assert.equal(name,"ha_call_service");
   assert.deepEqual(args,{domain:"light",service:"turn_off",entity_id:"light.ves_svet"});
   writes++;
  },
 });
 const issued=mock.issue({...actor,text:"Выключи весь свет"});
 assert.equal(issued.status,"pending");
 assert.equal((await mock.confirm({...actor,userId:77,token:issued.token})).status,"missing");
 assert.equal((await mock.confirm({...actor,token:issued.token})).status,"simulated");
 assert.equal((await mock.confirm({...actor,token:issued.token})).status,"missing");
 assert.equal(writes,1);
 assert.equal(mock.issue({...actor,text:"Включи весь свет"}).status,"denied");
 assert.equal(mock.issue({...actor,text:"Выключи весь свет на кухне"}).status,"denied");
});
test("wrong Yandex entity, changed group and canceled token never write",async()=>{
 for(const group of [
  {entity_id:"light.ves_svet_2",platform:"yandex_station",attributes:{entity_id:members}},
  {entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:members.slice(1)}},
  {entity_id:"light.ves_svet",platform:"group",attributes:{entity_id:[...members.slice(1),members[1]]}},
 ]){
  let writes=0;
  const mock=createV3WholeHouseOffMock({reviewedMembers:members,readGroup:async()=>group,simulateWrite:async()=>writes++});
  const issued=mock.issue({...actor,text:"Выключи весь свет"});
  assert.equal((await mock.confirm({...actor,token:issued.token})).status,"denied");
  mock.cancel(actor);
  assert.equal((await mock.confirm({...actor,token:issued.token})).status,"missing");
  assert.equal(writes,0);
 }
});
