import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectKitchenMcpEndpoint} from '../src/pilot/kitchen-mcp-endpoint-policy.mjs';

test('pilot MCP endpoint permits only exact approved loopback or TLS hosts',()=>{
 for(const endpoint of ['http://127.0.0.1:9584/mcp','http://localhost:9584/mcp','https://homeassistant.local/mcp','https://192.168.31.94/mcp']){
  assert.equal(inspectKitchenMcpEndpoint(endpoint).allowed,true,endpoint);
 }
});
test('pilot MCP endpoint rejects credentials, redirects via host and unauthenticated LAN HTTP',()=>{
 for(const endpoint of ['http://homeassistant.local:9584/mcp','http://192.168.31.94:9584/mcp','https://user:pass@homeassistant.local/mcp','https://homeassistant.local.evil.test/mcp','http://127.0.0.1:9584/mcp?token=x','https://homeassistant.local/mcp#frag','file:///etc/passwd']){
  assert.equal(inspectKitchenMcpEndpoint(endpoint).allowed,false,endpoint);
 }
});
