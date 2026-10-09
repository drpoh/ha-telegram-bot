import {createTelegramTransportAdmission} from './v3-telegram-transport-admission.mjs';

// Isolated-only glue: supplied ctx objects are NOT independently authenticated.
// Production must construct/call this exclusively inside Telegraf's handler.
export function createV3TelegramJoinedAdapter({allowedUserId,clock=Date.now,requireRawMessage=false,durableReplay}={}){
 const admission=createTelegramTransportAdmission({allowedUserId,clock,requireRawMessage,durableReplay});
 return ({issueVerified})=>{
  if(typeof issueVerified!=='function')throw Error('missing_trusted_issuer');
  return ({ctx,action,ttlMs}={})=>{
   const checked=admission.inspect(ctx);
   if(!checked.accepted)return {status:'denied',reason:checked.reason};
   return issueVerified({source:'telegram',sourceId:String(checked.chatId),
    actorId:checked.actorId,authenticated:true,text:checked.text,
    issuedAt:checked.issuedAt,action,ttlMs});
  };
 };
}
