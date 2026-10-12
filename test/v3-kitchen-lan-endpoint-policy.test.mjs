import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectKitchenLanEndpoint as check} from '../src/pilot/kitchen-lan-endpoint-policy.mjs';
const url='http://192.168.31.94:9584/api/mcp';
test('LAN exception remains closed unless both independent reviews supplied',()=>{
 assert.equal(check(url).allowed,false);
 assert.equal(check(url,{networkRestrictionVerified:true}).allowed,false);
 assert.equal(check(url,{credentialScopeReviewed:true}).allowed,false);
 assert.equal(check(url,{networkRestrictionVerified:true,credentialScopeReviewed:true}).allowed,true);
});
test('LAN exception rejects other hosts, credentials, queries and protocols',()=>{
 const grants={networkRestrictionVerified:true,credentialScopeReviewed:true};
 for(const bad of ['http://192.168.31.95:9584/api/mcp','http://192.168.31.94:9585/api/mcp','https://192.168.31.94:9584/api/mcp','http://user:pass@192.168.31.94:9584/api/mcp',url+'?x=1'])assert.equal(check(bad,grants).allowed,false,bad);
});
