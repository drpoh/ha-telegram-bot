import test from 'node:test';
import assert from 'node:assert/strict';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';

test('journal claim exception denies physical execution, consumes confirmation',async()=>{
 let calls=0;
 const actor={userId:123,chatId:123};
 const pilot=createKitchenDryrunConsent({executionJournal:{claim(){throw Error('io failure')}},dispatch:async()=>{calls++;return {status:'verified'}}});
 assert.equal(pilot.request(actor,'включи свет на кухне').status,'pending');
 assert.deepEqual(await pilot.confirm(actor),{status:'denied',reason:'replay_claim_unavailable'});
 assert.equal(calls,0);
 assert.equal((await pilot.confirm(actor)).status,'missing');
});
