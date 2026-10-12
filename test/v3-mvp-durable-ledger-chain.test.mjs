import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createV3IntentLedger} from '../src/decision/v3-intent-ledger.mjs';
import {createLedgerBoundMockDispatcher} from '../src/decision/v3-ledger-bound-mock.mjs';
import {createGateCExecutionJournal} from '../src/decision/v3-gate-c-execution-journal.mjs';

test('MVP: actor-bound confirmation, reviewed light policy, durable claim, readback, replay rejection',async()=>{
 const root=mkdtempSync(join(tmpdir(),'v3-mvp-chain-'));
 try{
  const configPath=join(root,'review.json');
  writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:'kitchen',area_name:'Кухня',light_ids:['light.tambur_svet_l1'],excluded_light_ids:[],switch_light_ids:[]}]}));
  const ledger=createV3IntentLedger();
  const journal=createGateCExecutionJournal({dbPath:join(root,'claims.db')});
  const actor={userId:123,chatId:456};
  const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.tambur_svet_l1'}};
  const {token}=ledger.issue({...actor,userText:'Включи весь свет в Кухня',action});
  let writes=0,state='off';
  const readTool=async(name,args)=>{
   if(name==='ha_list_floors_areas')return {structuredContent:{success:true,floors:[{areas:[{area_id:'kitchen',name:'Кухня'}]}],unassigned_areas:[]}};
   if(name==='ha_search')return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==='light'?1:0,entities:args.domain_filter==='light'?[{entity_id:'light.tambur_svet_l1',domain:'light',area:'Кухня'}]:[]}};
   if(name==='ha_get_state')return {structuredContent:{data:{entity_id:args.entity_id,state}}};
   throw Error('unexpected_tool');
  };
  const dispatch=createLedgerBoundMockDispatcher({ledger,executionJournal:journal,configPath,readTool,
   policy:{entities:{'light.tambur_svet_l1':{level:'confirm',services:['turn_on']}}},
   simulateWrite:async()=>{writes++;state='on';return {structuredContent:{success:true}};}});
  assert.equal((await dispatch({userId:999,chatId:456,token})).status,'missing');
  const result=await dispatch({...actor,token});
  assert.equal(result.status,'verified');
  assert.equal(journal.inspect(token),'verified');
  assert.equal((await dispatch({...actor,token})).status,'missing');
  assert.equal(createGateCExecutionJournal({dbPath:join(root,'claims.db')}).claim(token),false);
  assert.equal(writes,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});
