import test from 'node:test';
import assert from 'node:assert/strict';
import {createRegistryFrameSession} from '../src/decision/v3-ha-registry-ws-frames.mjs';
const start=()=>{const s=createRegistryFrameSession();assert.equal(s.receive('{"type":"auth_required"}').ok,true);assert.equal(s.receive('{"type":"auth_ok"}').ok,true);return s;};
test('only fixed read operations are emitted and paired with exact request ID',()=>{
 const s=start();assert.equal(s.command('call_service').ok,false);
 const cmd=s.command('config/device_registry/list');assert.deepEqual(JSON.parse(cmd.frame),{id:1,type:'config/device_registry/list'});
 assert.equal(s.command('config/entity_registry/list').ok,false);
 const result=s.receive('{"type":"result","id":1,"success":true,"result":[]}');
 assert.equal(result.ok,true);assert.equal(result.authorization,false);
});
test('auth errors, malformed frames, wrong IDs and oversized frames fail closed',()=>{
 for(const bad of ['{}','{"type":"auth_invalid"}']){const s=createRegistryFrameSession();assert.equal(s.receive(bad).ok,false);}
 const s=createRegistryFrameSession();s.receive('{"type":"auth_required"}');assert.equal(s.receive('{"type":"auth_invalid"}').ok,false);
 const wrong=start();wrong.command('config/area_registry/list');assert.equal(wrong.receive('{"type":"result","id":3,"success":true,"result":[]}').ok,false);
 const large=start();assert.equal(large.receive(' '.repeat(1048577)).ok,false);
 assert.equal(start().abort().authorization,false);
});
