import {randomUUID} from "node:crypto";

// In-memory fixture-only consent store. Deliberately not the v2 persisted queue.
// Only a trusted Telegram ingestion adapter may call issue(); AI tool results
// and generated action arguments must never be accepted as user provenance.
export function createV3IntentLedger({clock=Date.now}={}){
 const records=new Map();
 const key=(userId,chatId)=>JSON.stringify([userId,chatId]);
 const validActor=(userId,chatId)=>(
  (typeof userId==="string" || Number.isSafeInteger(userId)) &&
  (typeof chatId==="string" || Number.isSafeInteger(chatId)) &&
  String(userId).length>0 && String(chatId).length>0
 );
 return Object.freeze({
  issue({userId,chatId,userText,action,ttlMs=60000}={}){
   if(!validActor(userId,chatId) || typeof userText!=="string" || !userText.trim() ||
      !action?.name || !action?.args || !Number.isSafeInteger(ttlMs) || ttlMs<1 || ttlMs>60000)
    throw Error("invalid_intent");
   const token=randomUUID();
   const record={userId,chatId,token,originalUserText:userText,action:structuredClone(action),
    expiresAt:clock()+ttlMs};
   records.set(key(userId,chatId),record);
   return {token,expiresAt:record.expiresAt};
  },
  inspect({userId,chatId,token}={}){
   const id=key(userId,chatId),record=records.get(id);
   if(!record || record.token!==token)return null;
   if(clock()>=record.expiresAt){records.delete(id);return null;}
   return structuredClone(record);
  },
  consume({userId,chatId,token}={}){
   const record=this.inspect({userId,chatId,token});
   if(record)records.delete(key(userId,chatId));
   return record;
  },
  cancel({userId,chatId}={}){return records.delete(key(userId,chatId));},
 });
}
