import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createKitchenDryrunConsent} from '../src/pilot/kitchen-dryrun-consent.mjs';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

const actor={userId:123,chatId:123};
test('MVP pilot consent: durable UUID claim before execution, unknown result cannot replay',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'pilot-mvp-'));
 try{
  const journal=createGateCExecutionJournal({dbPath:join(dir,'claims.db')});
  let calls=0,claimed=[];
  const consent=createKitchenDryrunConsent({executionJournal:{
   claim(id){claimed.push(id);return journal.claim(id);},
   mark:(id,status)=>journal.mark(id,status)
  },dispatch:async()=>{calls++;throw Error('MCP unknown outcome');}});
  assert.equal(consent.request(actor,'Включи свет в тамбуре').status,'pending');
  assert.equal((await consent.confirm(actor)).status,'failed');
  assert.equal((await consent.confirm(actor)).status,'missing');
  assert.equal(calls,1);
  assert.equal(claimed.length,1);
  assert.equal(journal.inspect(claimed[0]),'unverified');
  assert.equal(createGateCExecutionJournal({dbPath:join(dir,'claims.db')}).claim(claimed[0]),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('MVP pilot consent: unavailable durable journal fails closed before dispatch',async()=>{
 let writes=0;
 const consent=createKitchenDryrunConsent({executionJournal:{claim:()=>false},dispatch:async()=>{writes++;}});
 consent.request(actor,'Выключи свет в тамбуре');
 assert.deepEqual(await consent.confirm(actor),{status:'denied',reason:'replay_claim_unavailable'});
 assert.equal(writes,0);
});
