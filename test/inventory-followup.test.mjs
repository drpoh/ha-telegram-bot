import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveInventoryFollowup} from '../src/home/inventory-followup.mjs';
test('room follow-up',()=>{
 assert.equal(resolveInventoryFollowup('А в коридоре?',true),'Какие устройства в коридоре?');
 assert.equal(resolveInventoryFollowup('А в коридоре?',false),null);
 assert.equal(resolveInventoryFollowup('Выключи свет',true),null);
});
