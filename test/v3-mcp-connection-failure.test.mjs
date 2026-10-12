import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyMcpConnectionFailure} from '../src/home/mcp-connection-failure.mjs';
test('classifies stable transport codes and rejects raw sensitive errors',()=>{
 for(const code of ['ECONNREFUSED','ETIMEDOUT','ENETUNREACH','EHOSTUNREACH','ECONNRESET','ENOTFOUND','EAI_AGAIN'])
  assert.equal(classifyMcpConnectionFailure({cause:{code}}),code.toLowerCase());
 assert.equal(classifyMcpConnectionFailure({message:'HTTP 403 from private URL with token'}),'http_access_denied');
 assert.equal(classifyMcpConnectionFailure({message:'HTTP 404'}),'http_not_found');
 assert.equal(classifyMcpConnectionFailure({message:'HTTP 500'}),'http_server_error');
 assert.equal(classifyMcpConnectionFailure({name:'AbortError'}),'timeout');
 assert.equal(classifyMcpConnectionFailure({message:'private token abc'}),'connect_failed');
});
