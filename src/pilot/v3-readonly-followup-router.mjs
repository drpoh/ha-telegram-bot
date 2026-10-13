// Per-private-chat, in-memory read-only follow-ups; no LLM, DB, service calls or HA writes.
// A follow-up never authorizes a device: it can only select the fixed existing read scopes.
import {classifyReadonlyQuestion} from '../home/readonly-question-intent.mjs';
import {summarizeCorridorLights} from '../home/corridor-light-readonly-status.mjs';
import {routeV3ReadonlyQuestion} from './v3-readonly-question-router.mjs';

const supported=new Set(['lights','kitchen_review','tambour']);
const normalize=value=>typeof value==='string'?
 value.toLocaleLowerCase('ru-RU').replace(/ё/g,'е').trim()
  .replace(/[?!.]+$/g,'').replace(/\s+/g,' '):'';
const followupIntent=Object.freeze({
 'а в коридоре':'corridor',
 'а на кухне':'kitchen_review',
 'а в тамбуре':'tambour'
});
const deny=(status,text)=>({handled:true,status,authorization:false,actualWrite:false,text});
const clarification=()=>deny('unsupported',
 'Для уточнения сначала спросите о свете, например: «Что со светом на кухне?». Никаких команд не отправлено.');
const unsupported=()=>deny('unsupported',
 'Неоднозначный или неподдерживаемый запрос. Уточните вопрос о свете без команды управления.');
const unavailable=()=>deny('unavailable',
 'Не удалось проверить выбранный свет. Состояние неизвестно. Никаких команд не отправлено.');
const validActor=actor=>Number.isSafeInteger(actor?.userId)&&actor.userId>0 &&
 Number.isSafeInteger(actor?.chatId)&&actor.chatId>0&&actor.userId===actor.chatId;
const validResult=result=>result?.handled===true &&
 ['complete','partial'].includes(result.status) &&
 result.authorization===false && result.actualWrite===false &&
 typeof result.text==='string' && result.text.trim().length>0;

export function createV3ReadonlyFollowupRouter({clock=Date.now,ttlMs=120000}={}){
 if(typeof clock!=='function'||!Number.isSafeInteger(ttlMs)||ttlMs<1000||ttlMs>300000)
  throw Error('invalid_followup_configuration');
 const sessions=new Map();
 const route=async ({actor,text,readState,readKitchenState}={})=>{
  // Untrusted actor must never create a conversation or route into a write path.
  if(!validActor(actor))return unavailable();
  const key=actor.userId+':'+actor.chatId;
  const normalized=normalize(text);
  const kind=Object.hasOwn(followupIntent,normalized)?followupIntent[normalized]:null;
  const old=sessions.get(key);
  if(kind){
   sessions.delete(key);
   const now=clock();
   if(!old||!Number.isSafeInteger(now)||now<old.at||now-old.at>ttlMs ||
     !supported.has(old.kind))return clarification();
   let result;
   if(kind==='corridor')result=await summarizeCorridorLights({readState});
   else result=await routeV3ReadonlyQuestion({
    text:kind==='kitchen_review'?'Что со светом на кухне?':'Что со светом в тамбуре?',
    readState,readKitchenState
   });
   // New state context is never established on unknown/failed reads.
   const answer=kind==='corridor'?{handled:true,...result}:result;
   if(!validResult(answer))return unavailable();
   sessions.set(key,{kind:kind==='corridor'?'lights':kind,at:now});
   return answer;
  }
  // Reject near-match and mixed requests rather than dispatching them as actions.
  if(/^а\s+(?:в|на)\s/.test(normalized)){
   sessions.delete(key);
   return unsupported();
  }
  const intent=classifyReadonlyQuestion(text);
  const answer=await routeV3ReadonlyQuestion({text,readState,readKitchenState});
  const now=clock();
  if(supported.has(intent)&&validResult(answer)&&Number.isSafeInteger(now)){
   sessions.set(key,{kind:intent,at:now});
  }else sessions.delete(key);
  return answer;
 };
 return Object.freeze({route});
}
