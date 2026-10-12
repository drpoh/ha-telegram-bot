import {randomUUID} from "node:crypto";

// Mock-only, device/channel-scoped consent proposals for channel-neutral v3.
// Does not establish identity, grant permissions or authorize HA execution.
export function createV3ChannelIntentLedger({clock=Date.now}={}){
 const pending=new Map();
 function identity(command){
  if(!command || !["assist","telegram","local_test"].includes(command.source) ||
   typeof command.sourceId!=="string" || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(command.sourceId) ||
   !["device_only","authenticated_transport"].includes(command.assurance) ||
   typeof command.originalText!=="string" || !command.originalText.trim())return null;
  if(command.source==="assist" && (command.assurance!=="device_only" || command.actorId!==null))return null;
  if(command.source==="telegram" && (command.assurance!=="authenticated_transport" || !Number.isSafeInteger(command.actorId)))return null;
  return JSON.stringify([command.source,command.sourceId,command.actorId??null]);
 }
 return Object.freeze({
  propose({command,action,ttlMs=60000}={}){
   const id=identity(command);
   if(!id || !action?.name || !action?.args || !Number.isSafeInteger(ttlMs) || ttlMs<1 || ttlMs>60000)throw Error("invalid_channel_intent");
   const token=randomUUID(),expiresAt=clock()+ttlMs;
   pending.set(id,{token,expiresAt,command:structuredClone(command),action:structuredClone(action)});
   return {token,expiresAt};
  },
  consume({command,token}={}){
   const id=identity(command),entry=id && pending.get(id);
   if(!entry || entry.token!==token)return null;
   if(clock()>=entry.expiresAt){pending.delete(id);return null;}
   // Reject a changed request even when it has the same device identity.
   if(JSON.stringify(command)!==JSON.stringify(entry.command))return null;
   pending.delete(id);
   return structuredClone(entry);
  },
  cancel({command}={}){
   const id=identity(command);
   return id?pending.delete(id):false;
  },
 });
}
