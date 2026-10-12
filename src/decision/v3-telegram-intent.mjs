// Isolated v3 Telegram input adapter; never connected to running v2.
// Authentication is the Telegram framework's responsibility; this function
// only validates the authenticated context passed by a trusted entrypoint.
export function extractV3TelegramIntent(ctx,{allowedUserId}={}){
 const from=ctx?.from,chat=ctx?.chat,msg=ctx?.message;
 if(!Number.isSafeInteger(allowedUserId) || from?.id!==allowedUserId ||
    !Number.isSafeInteger(chat?.id) || msg?.chat?.id!==chat.id ||
    msg?.from?.id!==from.id || typeof msg?.text!=="string")
  return {accepted:false,reason:"untrusted_event"};
 const text=msg.text.trim();
 if(!text || text.startsWith("/") || text.length>1000 ||
    msg.forward_origin || msg.is_automatic_forward)
  return {accepted:false,reason:"unsupported_message"};
 return {accepted:true,actor:{userId:from.id,chatId:chat.id},originalUserText:text};
}
