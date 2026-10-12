import test from 'node:test';
import assert from 'node:assert/strict';
import {assessHaRegistryEndpoint} from '../src/decision/v3-ha-registry-endpoint-policy.mjs';
const good={endpoint:'wss://ha.example.invalid/api/websocket',credentialSource:'protected_local_secret',tlsPinned:true,operatorConfigured:true};
test('operator-bound endpoint syntax remains review-only',()=>{
 const r=assessHaRegistryEndpoint(good);
 assert.equal(r.accepted,true);assert.equal(r.authorization,false);
});
test('insecure, injected, credentialed and unreviewed destinations deny',()=>{
 for(const endpoint of ['ws://ha.example.invalid/api/websocket','wss://user:pass@ha.example.invalid/api/websocket',
 'wss://ha.example.invalid/api/websocket?token=abc','wss://ha.example.invalid/other',
 'wss://ha.example.invalid/api/websocket#fragment','https://ha.example.invalid/api/websocket','bad url'])
  assert.equal(assessHaRegistryEndpoint({...good,endpoint}).accepted,false);
 for(const x of [{tlsPinned:false},{operatorConfigured:false},{credentialSource:'model_input'}])
  assert.equal(assessHaRegistryEndpoint({...good,...x}).accepted,false);
});
