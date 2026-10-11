import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

const tempDb=()=>{const dir=mkdtempSync(join(tmpdir(),'gate-c-cross-process-'));return {dir,db:join(dir,'claims.db')};};
const invokeWorker=({db,actionId,mode='claim'})=>new Promise((resolve,reject)=>{
 const script=`import {createGateCExecutionJournal} from './src/decision/v3-gate-c-execution-journal.mjs';
 const j=createGateCExecutionJournal({dbPath:process.argv[1]});
 const result=j.claim(process.argv[2]);
 if(process.argv[3]==='crash')process.exit(result?17:18);
 process.stdout.write(result?'claimed':'denied');`;
 const child=spawn(process.execPath,['--input-type=module','--eval',script,db,actionId,mode],{
  cwd:process.cwd(),env:process.env,stdio:['ignore','pipe','pipe']
 });
 let stdout='',stderr='';
 child.stdout.on('data',chunk=>stdout+=chunk);
 child.stderr.on('data',chunk=>stderr+=chunk);
 child.once('error',reject);
 child.once('close',exit=>resolve({exit,stdout,stderr}));
});

test('SQLite claim remains consumed after simulated process crash before outcome mark',async()=>{
 const {dir,db}=tempDb();try{
  const actionId=randomUUID();
  const first=await invokeWorker({db,actionId,mode:'crash'});
  assert.equal(first.exit,17,first.stderr);
  assert.equal(createGateCExecutionJournal({dbPath:db}).inspect(actionId),'unknown');
  const restarted=await invokeWorker({db,actionId});
  assert.equal(restarted.exit,0,restarted.stderr);
  assert.equal(restarted.stdout,'denied');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('parallel independent processes cannot claim same action twice',async()=>{
 const {dir,db}=tempDb();try{
  const actionId=randomUUID();
  // Initialize SQLite schema before concurrent claims to isolate the atomicity check.
  createGateCExecutionJournal({dbPath:db});
  const results=await Promise.all(Array.from({length:5},()=>invokeWorker({db,actionId})));
  assert.equal(results.filter(x=>x.exit!==0).length,0,JSON.stringify(results));
  assert.equal(results.filter(x=>x.stdout==='claimed').length,1,JSON.stringify(results));
  assert.equal(results.filter(x=>x.stdout==='denied').length,4,JSON.stringify(results));
  assert.equal(createGateCExecutionJournal({dbPath:db}).inspect(actionId),'unknown');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('verified or unverified outcomes never make a claimed ID reusable',async()=>{
 const {dir,db}=tempDb();try{
  const j=createGateCExecutionJournal({dbPath:db});
  for(const outcome of ['verified','unverified']){
   const actionId=randomUUID();
   assert.equal(j.claim(actionId),true);
   assert.equal(j.mark(actionId,outcome),true);
   assert.equal(j.mark(actionId,'verified'),false);
   const next=await invokeWorker({db,actionId});
   assert.equal(next.exit,0,next.stderr);
   assert.equal(next.stdout,'denied');
   assert.equal(j.inspect(actionId),outcome);
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
