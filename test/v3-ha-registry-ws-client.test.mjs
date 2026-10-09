import test from 'node:test';
import assert from 'node:assert/strict';
import {testRegistrySocket} from '../src/decision/v3-ha-registry-ws-client.mjs';
function mock(mode='normal'){
 const sent=[];let closed=false;
 return {sent,get closed(){return closed;},async exchange(frame){
  sent.push(frame);const n=sent.length;
  if(mode==='timeout'&&n===3)return new Promise(()=>{});
  if(mode==='disconnect'&&n===3)throw Error('socket closed');
  if(n===1)return JSON.stringify({type:'auth_required'});
  if(n===2)return JSON.stringify({type:mode==='bad_auth'?'auth_invalid':'auth_ok'});
  const request=JSON.parse(frame);return JSON.stringify({type:'result',id:mode==='bad_id'?99:request.id,success:true,result:[]});
 },async close(){closed=true;}};
}
test('mock protocol permits only registry reads and closes',async()=>{
 const socket=mock(),result=await testRegistrySocket({socket,token:'fixture'});
 assert.equal(result.ok,true);assert.equal(result.authorization,false);assert.equal(socket.closed,true);
 assert.equal(socket.sent.length,5);
 assert.equal(JSON.parse(socket.sent[1]).type,'auth');
});
test('denied tools, failed auth, disconnect, timeout and wrong IDs fail closed',async()=>{
 const bad=mock();assert.equal((await testRegistrySocket({socket:bad,token:'fixture',commands:['call_service']})).ok,false);
 assert.equal(bad.sent.length,0);
 for(const mode of ['bad_auth','disconnect','timeout','bad_id']){
  const socket=mock(mode);const r=await testRegistrySocket({socket,token:'fixture',timeoutMs:10});
  assert.equal(r.ok,false);assert.equal(r.authorization,false);assert.equal(socket.closed,true);
 }
});

test('timed-out pending mock exchange receives abort before socket closure',async()=>{
 let aborted=false,closed=false;
 const socket={
  async exchange(frame,{signal}={}){
   if(frame===null)return JSON.stringify({type:'auth_required'});
   if(JSON.parse(frame).type==='auth')return JSON.stringify({type:'auth_ok'});
   return new Promise((_,reject)=>{
    signal.addEventListener('abort',()=>{aborted=true;reject(Error('aborted'));},{once:true});
   });
  },
  async close(){closed=true;}
 };
 const result=await testRegistrySocket({socket,token:'fixture-only',timeoutMs:10});
 assert.equal(result.ok,false);
 assert.equal(result.authorization,false);
 assert.equal(aborted,true);
 assert.equal(closed,true);
});
