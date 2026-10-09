import {mkdirSync,openSync,closeSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
// Offline fixture. Persistent atomic claim of an event ID in a private sandbox.
// Never installed in live Assist ingress. Fail closed on filesystem errors.
export function createDurableAssistReplay({directory,maxEntries=256}={}){
 if(typeof directory!=='string'||!directory.startsWith('/')||!Number.isSafeInteger(maxEntries)||maxEntries<1)
  throw Error('invalid_replay_storage');
 return Object.freeze({
  claim(eventId){
   if(typeof eventId!=='string'||!/^[a-zA-Z0-9_.:-]{8,128}$/.test(eventId))return {accepted:false,reason:'invalid_event_id'};
   try{
    mkdirSync(directory,{recursive:true,mode:0o700});
    const filename=createHash('sha256').update(eventId).digest('hex')+'.claim';
    const names=readdirSync(directory);
    if(names.includes(filename))return {accepted:false,reason:'replayed_event'};
    if(names.length>=maxEntries)return {accepted:false,reason:'replay_capacity_exhausted'};
    const fd=openSync(join(directory,filename),'wx',0o600);closeSync(fd);
    return {accepted:true};
   }catch(e){return {accepted:false,reason:e?.code==='EEXIST'?'replayed_event':'replay_storage_failed'};}
  },
 });
}
