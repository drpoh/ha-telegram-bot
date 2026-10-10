import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createMcpExpressApp} from '@modelcontextprotocol/sdk/server/express.js';

async function fixture(run){
 const app=createMcpExpressApp({host:'127.0.0.1'});
 let seen=0;
 let release;
 let entered;
 const enteredPromise=new Promise(resolve=>entered=resolve);
 app.post('/mcp',async(req,res)=>{
  const server=new McpServer({name:'gate-c-loopback',version:'1.0.0'});
  server.registerTool('slow_fixture',{description:'Synthetic action, never HA'},async()=>{
   seen++;entered();await new Promise(resolve=>release=resolve);
   return {content:[{type:'text',text:'completed'}]};
  });
  const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
  try{await server.connect(transport);await transport.handleRequest(req,res,req.body);}
  catch{if(!res.headersSent)res.status(500).end();}
  res.on('close',()=>{void transport.close();void server.close();});
 });
 const listener=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 const address=listener.address();
 const client=new Client({name:'gate-c-client',version:'1.0.0'});
 const transport=new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`));
 try{
  await client.connect(transport);
  await run({client,enteredPromise,seen:()=>seen,finish:()=>release?.(),transport});
 }finally{
  release?.();
  await client.close().catch(()=>{});
  await new Promise(resolve=>listener.closeAllConnections? (listener.closeAllConnections(),listener.close(resolve)):listener.close(resolve));
 }
}
test('Gate C: actual loopback MCP HTTP request abort rejects response; no automatic redispatch',async()=>{
 await fixture(async({client,enteredPromise,seen,finish})=>{
  const abort=new AbortController();
  const request=client.callTool({name:'slow_fixture',arguments:{}},undefined,{signal:abort.signal,timeout:3000});
  await enteredPromise;
  abort.abort();
  await assert.rejects(request);
  finish();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(seen(),1);
 });
});
test('Gate C: actual loopback MCP HTTP deadline does not replay uncertain action',async()=>{
 await fixture(async({client,enteredPromise,seen,finish})=>{
  const request=client.callTool({name:'slow_fixture',arguments:{}},undefined,{timeout:50});
  await enteredPromise;
  await assert.rejects(request);
  finish();
  assert.equal(seen(),1);
 });
});
