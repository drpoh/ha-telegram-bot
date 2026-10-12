// Offline adapter fixture only. Call ONLY inside a Telegram transport handler
// after Telegraf has delivered a verified update. Never expose this function
// or its ctx argument as an LLM tool, network endpoint, or public API.
export function createV3TelegramIngressFixture({allowedUserId,clock=Date.now}={}){
 if(!Number.isSafeInteger(allowedUserId)||allowedUserId<=0)
  throw Error("invalid_transport_configuration");
 return ({issueVerified})=>{
  if(typeof issueVerified!=="function")throw Error("invalid_issuer");
  return ({ctx,action,ttlMs}={})=>{
   const userId=ctx?.from?.id,chatId=ctx?.chat?.id;
   const message=ctx?.message;
   if(!Number.isSafeInteger(userId)||userId!==allowedUserId ||
      !Number.isSafeInteger(chatId)||chatId<=0 ||
      message?.from?.id!==userId || message?.chat?.id!==chatId ||
      typeof message?.text!=="string" || !message.text.trim() ||
      message.text.startsWith("/") || !Number.isSafeInteger(message.date))
    return {status:"denied",reason:"untrusted_telegram_update"};
   // Timestamp from the transport message, not the model or action.
   return issueVerified({source:"telegram",sourceId:String(chatId),
    actorId:userId,authenticated:true,text:message.text,
    issuedAt:message.date*1000,action,ttlMs});
  };
 };
}
