import test from 'node:test';
import assert from 'node:assert/strict';
import {acquireAssistEntityRegistry} from '../src/decision/v3-assist-entity-registry-reader.mjs';
const entity={entityId:'light.fixture',areaId:'sauna',deviceId:'dev-1',available:true,disabled:false};
const valid={success:true,complete:true,partial:false,has_more:false,next_offset:null,entityCount:1,capturedAt:1000,entities:[entity]};
const acquire=(raw=valid)=>acquireAssistEntityRegistry({readRegistry:async ({readOnly})=>{assert.equal(readOnly,true);return raw;},now:1010});
test('Gate E registry reader verifies complete read-only contract',async()=>assert.equal((await acquire()).success,true));
test('Gate E registry reader rejects pagination, count mismatch, partial and stale',async()=>{
 for(const v of [{has_more:true},{next_offset:1},{entityCount:2},{partial:true},{complete:false},{capturedAt:-100000}])
  assert.equal((await acquire({...valid,...v})).success,false);
});
test('Gate E registry reader rejects duplicate/cross-domain and malformed entries',async()=>{
 for(const entries of [[entity,entity],[{...entity,entityId:'switch.lock'}],[{...entity,deviceId:''}]])
  assert.equal((await acquire({...valid,entityCount:entries.length,entities:entries})).success,false);
});
test('Gate E registry reader denies failed read',async()=>assert.equal((await acquireAssistEntityRegistry({readRegistry:async()=>{throw Error('offline');},now:1010})).success,false));
