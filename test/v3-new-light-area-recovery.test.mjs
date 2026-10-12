import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectNewLights} from '../src/home/new-light-review.mjs';
import {summarizeNewLightsByArea} from '../src/home/new-light-area-summary.mjs';

test('fresh room status recovers after unavailable; historical readings never override new results',async()=>{
 const first=await inspectNewLights({readState:async id=>({data:{entity_id:id,state:'unavailable'}})});
 const a=summarizeNewLightsByArea(first);
 assert.equal(a.status,'partial');
 assert.equal(a.areas.reduce((n,x)=>n+x.unknown,0),19);
 const second=await inspectNewLights({readState:async id=>({data:{entity_id:id,state:'on'}})});
 const b=summarizeNewLightsByArea(second);
 assert.equal(b.status,'complete');
 assert.equal(b.areas.reduce((n,x)=>n+x.on,0),19);
 assert.equal(b.areas.reduce((n,x)=>n+x.unknown,0),0);
 assert.equal(b.authorization,false);assert.equal(b.actualWrite,false);
});
