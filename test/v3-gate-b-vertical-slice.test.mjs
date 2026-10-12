import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createV3IntentLedger} from '../src/decision/v3-intent-ledger.mjs';
import {createLedgerBoundMockDispatcher} from '../src/decision/v3-ledger-bound-mock.mjs';

const actor={userId:9901,chatId:9902};
const action={name:'ha_call_service',args:{domain:'light',service:'turn_on',entity_id:'light.fixture'}};
const original='Включи весь свет в Комната';
function fixture(){
 const directory=mkdtempSync(join(tmpdir(),'v3-gate-b-slice-'));
 const configPath=join(directory,'reviewed.json');
 writeFileSync(configPath,JSON.stringify({version:1,areas:[{area_id:'room',area_name:'Комната',light_ids:['light.fixture'],excluded_light_ids:[],switch_light_ids:[]}]}));
 const ledger=createV3IntentLedger();let writes=0,state='off',foreign=false;
 const readTool=async(name,args)=>{
  if(name==='ha_list_floors_areas')return {structuredContent:{success:true,floors:[{areas:[{area_id:'room',name:'Комната'}]}],unassigned_areas:[]}};
  if(name==='ha_search')return {structuredContent:{success:true,partial:false,entity_has_more:false,entity_total_matches:args.domain_filter==='light'?1:0,entities:args.domain_filter==='light'?[{entity_id:foreign?'light.other':'light.fixture',domain:'light',area:'Комната'}]:[]}};
  if(name==='ha_get_state')return {structuredContent:{data:{entity_id:args.entity_id,state}}};
  throw Error('unexpected_read_tool');
 };
 const dispatch=createLedgerBoundMockDispatcher({ledger,policy:{entities:{'light.fixture':{level:'confirm',services:['turn_on']}}},configPath,readTool,simulateWrite:async()=>{writes++;state='on';return {structuredContent:{success:true}};}});
 return {ledger,dispatch,get writes(){return writes;},setForeign:value=>foreign=value,close:()=>rmSync(directory,{recursive:true,force:true})};
}

test('Gate B vertical slice binds original actor, chat, token, exact action and single consumption',async()=>{
 const f=fixture();try{
  const {token}=f.ledger.issue({...actor,userText:original,action});
  for(const wrong of [{...actor,userId:9903,token},{...actor,chatId:9904,token},{...actor,token:'forged'}])assert.equal((await f.dispatch(wrong)).status,'missing');
  assert.equal(f.writes,0);
  assert.equal((await f.dispatch({...actor,token})).status,'verified');
  assert.equal(f.writes,1);
  assert.equal((await f.dispatch({...actor,token})).status,'missing');
 }finally{f.close();}
});

test('Gate B vertical slice rejects tool substitution, scope drift and cancellation before execution',async()=>{
 const f=fixture();try{
  let ticket=f.ledger.issue({...actor,userText:original,action:{name:'ha_call_service',args:{domain:'homeassistant',service:'restart',entity_id:'light.fixture'}}});
  assert.equal((await f.dispatch({...actor,token:ticket.token})).status,'denied');
  ticket=f.ledger.issue({...actor,userText:original,action});
  f.setForeign(true);
  assert.notEqual((await f.dispatch({...actor,token:ticket.token})).status,'verified');
  f.setForeign(false);
  ticket=f.ledger.issue({...actor,userText:original,action});
  f.ledger.cancel(actor);
  assert.equal((await f.dispatch({...actor,token:ticket.token})).status,'missing');
  assert.equal(f.writes,0);
 }finally{f.close();}
});
