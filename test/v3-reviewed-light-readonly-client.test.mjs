import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewedLightReadonlyReader} from '../src/home/reviewed-light-readonly-client.mjs';

const url='http://192.168.31.94:9584/api/mcp';
test('new light read only uses one exact ha_get_state call and closes client',async()=>{
 const calls=[];
 const client={
  connect:async transport=>{calls.push(['connect',transport]);},
  callTool:async req=>{calls.push(['callTool',req]);return {data:{entity_id:req.arguments.entity_id,state:'on'}};},
  close:async()=>{calls.push(['close']);}
 };
 const read=createReviewedLightReadonlyReader({
  readConfig:()=>url,makeClient:()=>client,makeTransport:target=>({url:String(target)})
 });
 const result=await read('light.kukhnia_svet');
 assert.equal(result.data.state,'on');
 assert.deepEqual(calls.map(x=>x[0]),['connect','callTool','close']);
 assert.deepEqual(calls[1][1],{name:'ha_get_state',arguments:{entity_id:'light.kukhnia_svet'}});
 assert.equal(calls[0][1].url,url);
});
test('unlisted, malicious and old pilot IDs fail before config access',async()=>{
 let access=0;
 const read=createReviewedLightReadonlyReader({readConfig:()=>{access++;return url;}});
 for(const id of ['light.browser_mod_fake','light.koridor','light.tambur_svet_l1',
  'switch.vannaia_svet','light.kukhnia_svet,light.liustra','light.some_fake',undefined]){
  await assert.rejects(()=>read(id),/scope_denied/);
 }
 assert.equal(access,0);
});
test('untrusted endpoint fails before constructing MCP client',async()=>{
 let connected=0;
 for(const bad of ['https://evil.example/api/mcp','http://192.168.31.94:9584/api/mcp?token=secret']){
  const read=createReviewedLightReadonlyReader({readConfig:()=>bad,makeClient:()=>{connected++;return {};}});
  await assert.rejects(()=>read('light.kukhnia_svet'),/endpoint_denied/);
 }
 assert.equal(connected,0);
});
test('transport error is propagated and client is closed; never invokes service',async()=>{
 let closed=0;
 const read=createReviewedLightReadonlyReader({
  readConfig:()=>url,
  makeClient:()=>({
   connect:async()=>{},
   callTool:async()=>{throw Error('transport failed');},
   close:async()=>{closed++;}
  }),
  makeTransport:()=>({})
 });
 await assert.rejects(()=>read('light.kukhnia_svet'),/transport failed/);
 assert.equal(closed,1);
});
