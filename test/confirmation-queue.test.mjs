import test from "node:test";
import assert from "node:assert/strict";

import {
  clearPendingConfirmations,
  createPendingConfirmation,
} from "../src/decision/pending-confirmation.mjs";
import { queueConfirmedAction } from "../src/utils/queue.mjs";

test.beforeEach(() => clearPendingConfirmations());

test("confirmed queue executes exact stored action only once", async () => {
  const actor = { userId: 42, chatId: 99 };
  const original = {
    name: "ha_call_service",
    args: {
      domain: "lock",
      service: "unlock",
      entity_id: "lock.front_door",
    },
  };

  createPendingConfirmation({
    ...actor,
    action: original,
  });

  original.args.entity_id = "lock.tampered";

  const calls = [];
  const execute = async (name, args) => {
    calls.push({ name, args });
    return {
      structuredContent: { success: true },
      verification: { status: "confirmed" },
    };
  };

  const first = await queueConfirmedAction(actor, { execute, authorize: async () => true });
  const second = await queueConfirmedAction(actor, { execute });

  assert.equal(first.status, "executed");
  assert.equal(second.status, "missing");
  assert.deepEqual(calls, [{
    name: "ha_call_service",
    args: {
      domain: "lock",
      service: "unlock",
      entity_id: "lock.front_door",
    },
  }]);
});

test("confirmation for another actor cannot execute stored action", async () => {
  createPendingConfirmation({
    userId: 42,
    chatId: 99,
    action: {
      name: "ha_call_service",
      args: {
        domain: "lock",
        service: "unlock",
        entity_id: "lock.front_door",
      },
    },
  });

  let calls = 0;
  const result = await queueConfirmedAction(
    { userId: 43, chatId: 99 },
    { execute: async () => { calls++; } }
  );

  assert.equal(result.status, "missing");
  assert.equal(calls, 0);
});

test("confirmation never executes without an independent authorization gate",async()=>{
 const actor={userId:51,chatId:52};
 createPendingConfirmation({...actor,action:{name:"ha_call_service",args:{domain:"light",service:"turn_on",entity_id:"light.test"}}});
 let executed=0;
 const execute=async()=>{executed++;};
 const missing=await queueConfirmedAction(actor,{execute});
 assert.equal(missing.status,"authorization_unavailable");
 const rejected=await queueConfirmedAction(actor,{execute,authorize:async()=>false});
 assert.equal(rejected.status,"authorization_denied");
 const exception=await queueConfirmedAction(actor,{execute,authorize:async()=>{throw Error("policy offline");}});
 assert.equal(exception.status,"authorization_denied");
 assert.equal(executed,0);
});
