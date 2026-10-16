import test from "node:test";
import assert from "node:assert/strict";
import { extractRoomInventoryQuestion, replyToRoomInventory } from "../src/home/room-inventory-reply.mjs";

test("matches explicit read-only room inventory questions", () => {
  assert.equal(extractRoomInventoryQuestion("Какие устройства есть на кухне?"), "кухне");
  assert.equal(extractRoomInventoryQuestion("А какие устройства в коридоре?"), "коридоре");
  assert.equal(extractRoomInventoryQuestion("Выключи устройства на кухне"), null);
  assert.equal(extractRoomInventoryQuestion("Какие датчики на кухне?"), null);
});
test("returns HA registry answer without AI calls", async () => {
  const response=await replyToRoomInventory("Какие устройства в коридоре?", async(name) => {
    if(name==="ha_list_floors_areas")return {structuredContent:{success:true,floors:[{areas:[{area_id:"hall",name:"коридоре"}]}],unassigned_areas:[]}};
    return {structuredContent:{success:true,offset:0,count:1,total_count:1,has_more:false,next_offset:null,devices:[{area_id:"hall",name:"Датчик"}]}};
  });
  assert.match(response,/Датчик/);
  assert.match(response,/не полный список сущностей/);
});
test("fail-closed on area registry failures", async () => {
  const response=await replyToRoomInventory("Какие устройства на кухне?", async()=>({isError:true}));
  assert.match(response,/Не удалось подтвердить/);
});
