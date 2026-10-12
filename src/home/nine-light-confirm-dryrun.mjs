// OFFLINE DEV simulator of Telegram request → /confirm, for 9 reviewed candidates.
// Deliberately has NO dispatch/callTool and NO production authorization.
import {RESPONDING_NEW_LIGHT_IDS} from './responding-new-light-batch.mjs';
const allowed=new Set(RESPONDING_NEW_LIGHT_IDS);
export function createNineLightConfirmDryrun({clock=Date.now,ttlMs=60000}={}){
 const pending=new Map();
 const owner=a=>Number.isSafeInteger(a?.userId)&&a.userId>0&&a.chatId===a.userId;
 return Object.freeze({
  request(actor,{entityId,service}={}){
   if(!owner(actor)||!allowed.has(entityId)||!['turn_on','turn_off'].includes(service))
    return {status:'denied',actualWrite:false};
   pending.set(actor.userId,{entityId,service,expiresAt:clock()+ttlMs});
   return {status:'pending',entityId,service,requires:'/confirm',actualWrite:false};
  },
  confirm(actor){
   if(!owner(actor))return {status:'denied',actualWrite:false};
   const p=pending.get(actor.userId);
   pending.delete(actor.userId);
   if(!p||clock()>=p.expiresAt)return {status:'missing_or_expired',actualWrite:false};
   return {status:'simulated',entityId:p.entityId,service:p.service,actualWrite:false,
    message:'DEV simulation only. No HA command was sent.'};
  },
  cancel(actor){
   if(!owner(actor))return {status:'denied',actualWrite:false};
   const existed=pending.delete(actor.userId);
   return {status:existed?'cancelled':'missing',actualWrite:false};
  }
 });
}
