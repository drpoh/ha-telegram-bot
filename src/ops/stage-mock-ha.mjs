import {createServer} from 'node:http';

// Disposable, loopback-only HA-shaped read fixture. No HA client, MCP, auth,
// Telegram, service dispatcher, or secret is imported into this process.
export function createStageMockHa({host='127.0.0.1',port=0}={}){
 if(host!=='127.0.0.1'||!Number.isSafeInteger(port)||port<0||port>65535)
  throw Error('invalid_stage_bind');
 const server=createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'&&req.url==='/health'){
   res.writeHead(200);res.end(JSON.stringify({ok:true,environment:'stage',mode:'mock',haWrites:false}));return;
  }
  if(req.method==='GET'&&req.url==='/registry'){
   res.writeHead(200);res.end(JSON.stringify({entities:[],devices:[],areas:[],authorization:false}));return;
  }
  res.writeHead(403);res.end(JSON.stringify({success:false,error:'stage_denied'}));
 });
 return Object.freeze({
  async start(){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,()=>{server.off('error',reject);resolve();});});return server.address();},
  async close(){if(!server.listening)return;await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));},
 });
}
