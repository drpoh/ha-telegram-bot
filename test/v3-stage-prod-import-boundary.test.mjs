import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('live pilot entry does not import Stage selector or mock execution adapters',()=>{
 const live=source('src/pilot/telegram-readonly.mjs');
 assert.doesNotMatch(live,/stage-(?:batch|consent|target|mock)|v3-stage-target/);
 assert.match(live,/createKitchenDryrunConsent/);
 assert.match(live,/createKitchenMcpDispatchBoundary/);
});
test('Stage consent adapters do not import real pilot MCP clients or dispatch boundary',()=>{
 for(const path of ['src/ops/stage-consent-simulation.mjs','src/ops/stage-batch-consent.mjs','src/ops/stage-batch-http-simulation.mjs']){
  const contents=source(path);
  assert.doesNotMatch(contents,/kitchen-mcp-client|kitchen-mcp-dispatch-boundary|ha_call_service|src\/pilot\/telegram-readonly/);
 }
});
