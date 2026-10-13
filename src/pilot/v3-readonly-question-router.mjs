// Deterministic read-only natural-language route shared by the V3 Telegram pilot.
// Injected exact-state readers only. Never imports/accepts an action dispatcher or authorizes HA writes.
import {summarizeSauna} from '../home/sauna-status.mjs';
import {summarizeTambourLight} from '../home/tambour-light-status.mjs';
import {summarizeLightOverview} from '../home/light-overview.mjs';
import {summarizeReviewedKitchenLights} from '../home/kitchen-light-readonly-status.mjs';
import {classifyReadonlyQuestion,classifyLightQuestionMode} from '../home/readonly-question-intent.mjs';
import {classifySaunaQuestionMode} from '../home/sauna-question-mode.mjs';
import {classifyTambourQuestionMode} from '../home/tambour-question-mode.mjs';

const unsupportedText='Этот вопрос пока не поддерживается. Доступны температура сауны, свет в тамбуре, обзор выбранных светильников и чтение выбранных сущностей кухни.';
const unavailableText='Не удалось проверить состояние выбранных устройств. Никаких команд не отправлено.';

export async function routeV3ReadonlyQuestion({text,readState,readKitchenState}={}){
 const intent=classifyReadonlyQuestion(text);
 if(intent===null)return {handled:false,authorization:false,actualWrite:false};
 if(intent==='unsupported_question')return {
  handled:true,status:'unsupported',authorization:false,actualWrite:false,text:unsupportedText
 };
 try{
  let result;
  if(intent==='sauna')result=await summarizeSauna({
   readState,mode:classifySaunaQuestionMode(text)
  });
  else if(intent==='lights')result=await summarizeLightOverview({
   readState,mode:classifyLightQuestionMode(text)
  });
  else if(intent==='tambour')result=await summarizeTambourLight({
   readState,mode:classifyTambourQuestionMode(text)
  });
  else if(intent==='kitchen_review')result=await summarizeReviewedKitchenLights({
   readState:readKitchenState
  });
  else return {handled:true,status:'unavailable',authorization:false,actualWrite:false,text:unavailableText};
  // Fail closed even if a future summarizer accidentally returns authorization or a write flag.
  if(result?.authorization!==false||result?.actualWrite!==false||
     !['complete','partial','unavailable'].includes(result?.status)||
     typeof result?.text!=='string'||!result.text.trim())
   return {handled:true,status:'unavailable',authorization:false,actualWrite:false,text:unavailableText};
  return {handled:true,status:result.status,authorization:false,actualWrite:false,text:result.text};
 }catch{
  // Transport errors/credentials must never reach Telegram replies.
  return {handled:true,status:'unavailable',authorization:false,actualWrite:false,text:unavailableText};
 }
}
