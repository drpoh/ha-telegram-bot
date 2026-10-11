import {createV3IntentLedger} from '../decision/v3-intent-ledger.mjs';

// Telegram-only demonstration: no real HA client and no dispatch function.
export function createKitchenDryrunConsent({clock=Date.now,dispatch,executionJournal}={}){
 const ledger=createV3IntentLedger({clock});
 const intents=new Map();
 const inFlight=new Set();
 const key=(actor)=>JSON.stringify([actor.userId,actor.chatId]);
 const valid=(actor)=>Number.isSafeInteger(actor?.userId)&&actor.userId>0&&actor.userId===actor.chatId;
 return Object.freeze({
  request(actor,text){
   if(!valid(actor))return {status:'denied'};
   if(inFlight.has(key(actor)))return {status:'denied',reason:'action_in_flight'};
   const normalized=typeof text==='string'?text.toLowerCase().trim().replace(/ё/g,'е'):'';
   if(!['включи свет в тамбуре','выключи свет в тамбуре'].includes(normalized))return {status:'unsupported'};
   const service=normalized.startsWith('включи')?'turn_on':'turn_off';
   const issued=ledger.issue({...actor,userText:text,action:{name:'ha_call_service',args:{domain:'light',entity_id:'light.tambur_svet_l1',service}},ttlMs:60000});
   intents.set(key(actor),issued.token);
   return {status:'pending',expiresAt:issued.expiresAt};
  },
  async confirm(actor){
   if(!valid(actor))return {status:'denied'};
   const token=intents.get(key(actor));intents.delete(key(actor));
   const record=ledger.consume({...actor,token});
   if(!record)return {status:'missing'};
   if(inFlight.has(key(actor)))return {status:'denied',reason:'action_in_flight'};
   if(typeof dispatch!=='function')return {status:'simulated',service:record.action.args.service,actualWrite:false};
   // Optional external journal for future reviewed MVP rollout; never retry
   // after unknown outcome. Do not enable live execution merely by setting it.
   if(executionJournal!==undefined){
    try{
     if(typeof executionJournal?.claim!=='function'||!executionJournal.claim(token))
      return {status:'denied',reason:'replay_claim_unavailable'};
    }catch{
     return {status:'denied',reason:'replay_claim_unavailable'};
    }
   }
   inFlight.add(key(actor));
   try{
    const result=await dispatch({action:record.action,actor});
    executionJournal?.mark?.(token,result?.status==='verified'?'verified':'unverified');
    return result;
   }catch{
    try{executionJournal?.mark?.(token,'unverified');}catch{}
    return {status:'failed',reason:'dispatch_exception'};
   }finally{
    inFlight.delete(key(actor));
   }
  },
  cancel(actor){if(!valid(actor))return false;intents.delete(key(actor));return ledger.cancel(actor);}
 });
}
