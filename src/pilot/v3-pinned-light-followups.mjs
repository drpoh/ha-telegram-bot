// Pinned production light-question follow-ups: reuse DEV's bounded private-chat
// conversational pattern, but keep the currently deployed exact read IDs.
import {classifyReadonlyQuestion} from '../home/readonly-question-intent.mjs';
import {summarizeCorridorLights} from '../home/corridor-light-readonly-status.mjs';
import {summarizeReviewedKitchenLights} from '../home/kitchen-light-readonly-status.mjs';
import {summarizeTambourLight} from '../home/tambour-light-status.mjs';
import {summarizeLightOverview} from '../home/light-overview.mjs';

const followups=Object.freeze({
 'а в коридоре':'corridor',
 'а на кухне':'kitchen_review',
 'а в тамбуре':'tambour'
});
const permitted=new Set(['lights','corridor','kitchen_review','tambour']);
const normalize=v=>typeof v==='string'?v.toLocaleLowerCase('ru-RU')
 .replace(/ё/g,'е').trim().replace(/[?!.]+$/g,'').replace(/\s+/g,' '):'';
const result=(status,text)=>({handled:true,status,authorization:false,actualWrite:false,text});
const noContext=()=>result('unsupported','Сначала спросите о свете, например: «Какой свет на кухне?». Никаких команд не отправлено.');
const unknown=()=>result('unsupported','Уточнение не поддерживается. Спросите о свете в коридоре, на кухне или в тамбуре. Никаких команд не отправлено.');
const unavailable=()=>result('unavailable','Не удалось достоверно проверить выбранный свет. Никаких команд не отправлено.');
const validActor=a=>Number.isSafeInteger(a?.userId)&&a.userId>0&&
 Number.isSafeInteger(a?.chatId)&&a.chatId===a.userId;
const validRead=r=>['complete','partial'].includes(r?.status)&&r?.authorization===false&&
 r?.actualWrite===false&&typeof r?.text==='string'&&r.text.trim().length>0;

export function createPinnedLightFollowups({clock=Date.now,ttlMs=120000}={}){
 if(typeof clock!=='function'||!Number.isSafeInteger(ttlMs)||ttlMs<1000||ttlMs>300000)
  throw Error('invalid_followup_configuration');
 const sessions=new Map();
 return Object.freeze({
  // Called only for known private user, but repeat the identity check here.
  async route({actor,text,readState,readKitchenState}={}){
   if(!validActor(actor))return unavailable();
   const key=actor.userId+':'+actor.chatId,normalized=normalize(text);
   const target=Object.hasOwn(followups,normalized)?followups[normalized]:null;
   if(target||/^а\s+(?:в|на)\s/.test(normalized)){
    const prior=sessions.get(key);
    sessions.delete(key);
    if(!target)return unknown();
    const now=clock();
    if(!prior||!Number.isSafeInteger(now)||now<prior.at||now-prior.at>ttlMs||
       !permitted.has(prior.kind))return noContext();
    try{
     let answer;
     if(target==='corridor')answer=await summarizeCorridorLights({readState});
     else if(target==='kitchen_review')answer=await summarizeReviewedKitchenLights({readState:readKitchenState});
     else answer=await summarizeTambourLight({readState});
     if(!validRead(answer))return unavailable();
     sessions.set(key,{kind:target,at:now});
     return {handled:true,status:answer.status,authorization:false,actualWrite:false,text:answer.text};
    }catch{return unavailable();}
   }
   return {handled:false};
  },
  // Called after an existing direct read; failures and non-light questions erase context.
  remember({actor,text,answer}={}){
   if(!validActor(actor))return;
   const key=actor.userId+':'+actor.chatId;
   const kind=classifyReadonlyQuestion(text);
   const now=clock();
   if(permitted.has(kind)&&validRead(answer)&&Number.isSafeInteger(now))
    sessions.set(key,{kind,at:now});
   else sessions.delete(key);
  },
  clear(actor){
   if(validActor(actor))sessions.delete(actor.userId+':'+actor.chatId);
  }
 });
}
