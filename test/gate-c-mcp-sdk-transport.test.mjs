import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createGateCExecutionJournal,simulateGateCClaimedDispatch} from '../src/decision/v3-gate-c-execution-journal.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Real upstream MCP SDK protocol messages, but NO network, HA or runtime identity.
async function withSdk(handler){
 const [clientSide,serverSide]=InMemoryTransport.createLinkedPair();
 const server=new McpServer({name:'offline-gate-c',version:'1.0.0'});
 let calls=0;
 let mode='ok';
 server.registerTool('fixture_write',{description:'inert test only'},async()=>{
  calls++;
  if(mode==='hang')return new Promise(()=>{});
  if(mode==='error')throw Error('uncertain');
  return {content:[{type:'text',text:'simulated'}]};
 });
 const client=new Client({name:'offline-test',version:'1.0.0'});
 await server.connect(serverSide);await client.connect(clientSide);
 try{await handler({client,clientSide,setMode:v=>mode=v,calls:()=>calls});}
 finally{await client.close().catch(()=>{});await server.close().catch(()=>{});}
}
test('Gate C SDK: protocol response and duplicate durable claim',async()=>{
 await withSdk(async({client,calls})=>{
  const dir=mkdtempSync(join(tmpdir(),'gate-c-sdk-'));
  try{
   const journal=createGateCExecutionJournal({dbPath:join(dir,'stage.db')});
   const run=()=>simulateGateCClaimedDispatch({journal,actionId:'sdk-transport-action-0001',
    admit:async()=>true,invoke:()=>client.callTool({name:'fixture_write',arguments:{}},undefined,{timeout:500}),
    verify:result=>Boolean(result?.content?.[0]?.text==='simulated')});
   assert.equal((await run()).status,'verified');
   assert.equal((await run()).status,'duplicate_or_unavailable');
   assert.equal(calls(),1);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
});
test('Gate C SDK: timeout after dispatch is uncertain and cannot replay',async()=>{
 await withSdk(async({client,setMode,calls})=>{
  setMode('hang');
  const dir=mkdtempSync(join(tmpdir(),'gate-c-sdk-'));
  try{
   const journal=createGateCExecutionJournal({dbPath:join(dir,'stage.db')});
   const run=()=>simulateGateCClaimedDispatch({journal,actionId:'sdk-timeout-action-0001',
    admit:async()=>true,invoke:()=>client.callTool({name:'fixture_write',arguments:{}},undefined,{timeout:45}),
    verify:async()=>true});
   assert.equal((await run()).status,'unverified');
   assert.equal((await run()).status,'duplicate_or_unavailable');
   assert.equal(calls(),1);
  }finally{rmSync(dir,{recursive:true,force:true});}
 });
});
