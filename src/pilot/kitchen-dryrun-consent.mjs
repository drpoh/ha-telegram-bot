import {createV3IntentLedger} from '../decision/v3-intent-ledger.mjs';

// Telegram-only demonstration: no real HA client and no dispatch function.
export function createKitchenDryrunConsent({clock=Date.now,dispatch}={}){
 const ledger=createV3IntentLedger({clock});
 const intents=new Map();
 const key=(actor)=>JSON.stringify([actor.userId,actor.chatId]);
 const valid=(actor)=>Number.isSafeInteger(actor?.userId)&&actor.userId>0&&actor.userId===actor.chatId;
 return Object.freeze({
  request(actor,text){
   if(!valid(actor))return {status:'denied'};
   const normalized=typeof text==='string'?text.toLowerCase().trim().replace(/ё/g,'е'):'';
   if(!['включи свет на кухне','выключи свет на кухне'].includes(normalized))return {status:'unsupported'};
   const service=normalized.startsWith('включи')?'turn_on':'turn_off';
   const issued=ledger.issue({...actor,userText:text,action:{name:'ha_call_service',args:{domain:'light',entity_id:'light.led_kukhnia',service}},ttlMs:60000});
   intents.set(key(actor),issued.token);
   return {status:'pending',expiresAt:issued.expiresAt};
  },
  async confirm(actor){
   if(!valid(actor))return {status:'denied'};
   const token=intents.get(key(actor));intents.delete(key(actor));
   const record=ledger.consume({...actor,token});
   if(!record)return {status:'missing'};
   if(typeof dispatch!=='function')return {status:'simulated',service:record.action.args.service,actualWrite:false};
   try{return await dispatch({action:record.action,actor});}catch{return {status:'failed',reason:'dispatch_exception'};}
  },
  cancel(actor){if(!valid(actor))return false;intents.delete(key(actor));return ledger.cancel(actor);}
 });
}
