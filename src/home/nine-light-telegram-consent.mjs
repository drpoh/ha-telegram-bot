// DEV-only Telegram consent adapter, not wired into running bot.
// Reuse existing trusted intent ledger and guarded dispatcher, no direct HA access.
import {createV3IntentLedger} from '../decision/v3-intent-ledger.mjs';
import {RESPONDING_NEW_LIGHT_IDS} from './responding-new-light-batch.mjs';
const allowed=new Set(RESPONDING_NEW_LIGHT_IDS);
export function createNineLightTelegramConsent({dispatch,executionJournal,clock=Date.now}={}){
 const ledger=createV3IntentLedger({clock}),pending=new Map(),inFlight=new Set();
 const valid=actor=>Number.isSafeInteger(actor?.userId)&&actor.userId>0&&actor.userId===actor.chatId;
 return Object.freeze({
  request(actor,{entityId,service}={}){
   if(!valid(actor)||inFlight.has(actor.userId)||!allowed.has(entityId)||
      !['turn_on','turn_off'].includes(service))return {status:'denied'};
   const action={name:'ha_call_service',args:{domain:'light',entity_id:entityId,service}};
   const issued=ledger.issue({...actor,userText:service+' '+entityId,action,ttlMs:60000});
   pending.set(actor.userId,issued.token);
   return {status:'pending',entityId,service,requires:'/confirm',expiresAt:issued.expiresAt};
  },
  async confirm(actor){
   if(!valid(actor))return {status:'denied'};
   const token=pending.get(actor.userId);pending.delete(actor.userId);
   if(!token)return {status:'missing'};
   const record=ledger.consume({...actor,token});
   if(!record)return {status:'missing'};
   if(inFlight.has(actor.userId))return {status:'denied',reason:'action_in_flight'};
   if(typeof dispatch!=='function'||typeof executionJournal?.claim!=='function'||
      typeof executionJournal?.mark!=='function')return {status:'denied',reason:'trusted_dispatch_unavailable'};
   try{if(executionJournal.claim(token)!==true)return {status:'denied',reason:'replay_claim_unavailable'};}
   catch{return {status:'denied',reason:'replay_claim_unavailable'};}
   inFlight.add(actor.userId);
   try{
    let result;
    try{result=await dispatch({action:record.action,actor});}
    catch{result={status:'failed',reason:'dispatch_exception'};}
    try{if(executionJournal.mark(token,result?.status==='verified'?'verified':'unverified')!==true)
      return {status:'failed',reason:'journal_mark_unavailable'};}
    catch{return {status:'failed',reason:'journal_mark_unavailable'};}
    return result;
   }finally{inFlight.delete(actor.userId);}
  },
  cancel(actor){
   if(!valid(actor))return {status:'denied'};
   pending.delete(actor.userId);
   return {status:ledger.cancel(actor)?'cancelled':'missing'};
  }
 });
}
