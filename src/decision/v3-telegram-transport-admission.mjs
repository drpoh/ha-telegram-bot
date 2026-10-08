// Offline boundary component. The caller MUST be the actual trusted Telegraf handler.
// It does not establish authenticity of an arbitrarily supplied context object.
export function createTelegramTransportAdmission({allowedUserId,clock=Date.now,maxAgeMs=60000,maxSeen=2048}={}){
 if(!Number.isSafeInteger(allowedUserId)||allowedUserId<=0||typeof clock!=="function"||
 !Number.isSafeInteger(maxAgeMs)||maxAgeMs<1||maxAgeMs>300000||
 !Number.isSafeInteger(maxSeen)||maxSeen<1||maxSeen>10000)throw Error("invalid_transport_config");
 const seen=new Set();
 return Object.freeze({
  inspect(ctx){
   const msg=ctx?.message,from=ctx?.from,chat=ctx?.chat;
   const updateId=ctx?.update?.update_id;
   if(!Number.isSafeInteger(updateId)||updateId<0||
    !Number.isSafeInteger(msg?.message_id)||msg.message_id<1||
    !Number.isSafeInteger(from?.id)||from.id!==allowedUserId||
    !Number.isSafeInteger(chat?.id)||chat.id!==from.id||
    chat?.type!=="private"||msg?.chat?.id!==chat.id||
    msg?.from?.id!==from.id||!Number.isSafeInteger(msg?.date)||
    typeof msg?.text!=="string"||!msg.text.trim()||msg.text.startsWith("/"))
    return {accepted:false,reason:"invalid_transport_message"};
   const age=clock()-msg.date*1000;
   if(!Number.isFinite(age)||age< -5000||age>maxAgeMs)return {accepted:false,reason:"stale_transport_message"};
   const key=String(chat.id)+":"+String(updateId)+":"+String(msg.message_id);
   if(seen.has(key))return {accepted:false,reason:"duplicate_transport_message"};
   seen.add(key);
   if(seen.size>maxSeen)seen.delete(seen.values().next().value);
   return {accepted:true,actorId:from.id,chatId:chat.id,text:msg.text,issuedAt:msg.date*1000,authorization:false};
  }
 });
}
