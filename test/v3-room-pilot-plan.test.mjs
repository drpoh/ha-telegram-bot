import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectRoomPilotPlan} from '../src/decision/v3-room-pilot-plan.mjs';
const e=[{id:'light.room_lamp',areaId:'koridor',disabled:false,platform:'mqtt'}];
test('one room candidate remains unapproved',()=>{
 const r=inspectRoomPilotPlan({roomAreaId:'koridor',roomEntities:['light.room_lamp'],registryEntities:e});
 assert.equal(r.ready,false);assert.equal(r.authorized,false);
 assert.equal(r.candidate.confirmation,'telegram_each_action');
});
test('reject whole home, mismatched rooms, disabled and pseudo lights',()=>{
 const base={roomAreaId:'koridor',registryEntities:e};
 for(const id of ['light.ves_svet','light.ves_svet_2','light.other'])
  assert.equal(inspectRoomPilotPlan({...base,roomEntities:[id]}).authorized,false);
 assert.equal(inspectRoomPilotPlan({...base,roomEntities:['light.room_lamp'],registryEntities:[{...e[0],areaId:'kukhnia'}]}).reason,'unverified_room_target');
 assert.equal(inspectRoomPilotPlan({...base,roomEntities:['light.room_lamp'],registryEntities:[{...e[0],disabled:true}]}).reason,'unverified_room_target');
 assert.equal(inspectRoomPilotPlan({...base,roomEntities:['light.room_lamp'],registryEntities:[{...e[0],platform:'browser_mod'}]}).reason,'unverified_room_target');
});
