import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverNamedAreaLightSwitch as discover } from '../src/decision/named-light-switch.mjs';
const areaName = 'Ванная и Сауна';
const entityId = 'switch.vannaia_svet';
const entities = [
 { entity_id: entityId, domain: 'switch', area: areaName },
 { entity_id: 'switch.wled_gledopto_freeze', domain: 'switch', area: areaName },
];
function mock({ area = areaName, state = 'off', partial = false, hasMore = false, duplicate = false, missing = false, error = false } = {}) {
 const calls = [];
 const callTool = async (name, args) => {
  calls.push({ name, args });
  if (error) throw new Error('offline');
  if (name === 'ha_search') return { structuredContent: {
   success: true, partial, entity_has_more: hasMore, entity_total_matches: 2,
   entities: missing ? [entities[1], {entity_id:'switch.other',domain:'switch',area}] :
      duplicate ? [entities[0], entities[0]] : entities.map(e => ({...e, area})),
  }};
  return { structuredContent: {data: {entity_id:args.entity_id,state}} };
 };
 return { callTool, calls };
}
test('exact named switch passes and never includes other switches', async () => {
 const m=mock();
 const result=await discover({areaName,entityId,callTool:m.callTool});
 assert.deepEqual(result,{allowed:true,status:'verified',entityIds:[entityId]});
 assert.deepEqual(m.calls.map(c=>c.name),['ha_search','ha_get_state']);
 assert.equal(m.calls[1].args.entity_id,entityId);
});
test('unavailable switch fails closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({state:'unavailable'}).callTool})).allowed,false));
test('wrong room fails closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({area:'Кухня'}).callTool})).allowed,false));
test('missing target fails closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({missing:true}).callTool})).allowed,false));
test('partial results fail closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({partial:true}).callTool})).allowed,false));
test('pagination fails closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({hasMore:true}).callTool})).allowed,false));
test('duplicate entities fail closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({duplicate:true}).callTool})).allowed,false));
test('MCP error fails closed', async()=> assert.equal((await discover({areaName,entityId,callTool:mock({error:true}).callTool})).allowed,false));
test('not a switch target fails closed', async()=> assert.equal((await discover({areaName,entityId:'light.wled_gledopto',callTool:mock().callTool})).allowed,false));
