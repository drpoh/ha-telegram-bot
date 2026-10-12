import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';
const entry=new URL('../scripts/stage/mock-server.mjs',import.meta.url);
const env={PATH:process.env.PATH,HOME:process.env.HOME,RS_STAGE_PORT:'0'};
test('standalone stage entry exits fail-closed when a live token env exists',async()=>{
 const child=spawn(process.execPath,[entry.pathname],{env:{...env,TELEGRAM_BOT_TOKEN:'test-not-a-real-secret'},stdio:['ignore','pipe','pipe']});
 const code=await new Promise(resolve=>child.on('exit',resolve));assert.equal(code,64);
});
test('standalone stage binds loopback only and exits on SIGTERM',async()=>{
 const child=spawn(process.execPath,[entry.pathname],{env,stdio:['ignore','pipe','pipe']});
 try{
  const line=await new Promise((resolve,reject)=>{let body='';const timeout=setTimeout(()=>reject(Error('stage_start_timeout')),4000);child.stdout.on('data',d=>{body+=d.toString();if(body.includes('\n')){clearTimeout(timeout);resolve(body.split('\n')[0]);}});child.on('error',reject);child.on('exit',code=>reject(Error('stage_exited_'+code)));});
  const info=JSON.parse(line);assert.equal(info.address,'127.0.0.1');assert.equal(info.haWrites,false);
  const response=await fetch(`http://127.0.0.1:${info.port}/health`);assert.equal(response.status,200);
  child.kill('SIGTERM');assert.equal(await new Promise(resolve=>child.once('exit',resolve)),0);
 }finally{if(child.exitCode===null)child.kill('SIGKILL');}
});
test('reject invalid port configuration',async()=>{
 for(const port of ['80','65536','abc']){
  const child=spawn(process.execPath,[entry.pathname],{env:{...env,RS_STAGE_PORT:port},stdio:'ignore'});
  assert.equal(await new Promise(resolve=>child.once('exit',resolve)),64);
 }
});
test('reject presence of HA and AI credential environment keys',async()=>{
 for(const key of ['HA_TOKEN','MCP_URL','GEMINI_API_KEY']){
  const child=spawn(process.execPath,[entry.pathname],{env:{...env,[key]:'fixture-only'},stdio:'ignore'});
  assert.equal(await new Promise(resolve=>child.once('exit',resolve)),64);
 }
});
