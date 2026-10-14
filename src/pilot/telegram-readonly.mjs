import {readFileSync} from 'node:fs';
import {Telegraf} from 'telegraf';
import {createKitchenDryrunConsent} from './kitchen-dryrun-consent.mjs';
import {createKitchenMcpDispatchBoundary} from './kitchen-mcp-dispatch-boundary.mjs';
import {createKitchenLiveAdmission} from './kitchen-live-admission.mjs';
import {createKitchenMcpClient} from './kitchen-mcp-client.mjs';
import {prepareV3PilotExecutionJournal} from '../ops/v3-pilot-execution-journal.mjs';
import {summarizeSauna} from '../home/sauna-status.mjs';
import {summarizeTambourLight} from '../home/tambour-light-status.mjs';
import {summarizeLightOverview} from '../home/light-overview.mjs';
import {summarizeCorridorLights} from '../home/corridor-light-readonly-status.mjs';
import {summarizeReviewedKitchenLights} from '../home/kitchen-light-readonly-status.mjs';
import {classifyReadonlyQuestion} from '../home/readonly-question-intent.mjs';
import {createPinnedLightFollowups} from './v3-pinned-light-followups.mjs';
const base='/home/drpoh/.config/rs-home-ai-v3/';
const token=readFileSync(base+'telegram-token','utf8').trim();
const userId=Number(readFileSync(base+'allowed-user-id','utf8').trim());
if(!/^\d+:[A-Za-z0-9_-]{30,}$/.test(token)||!Number.isSafeInteger(userId)||userId<=0)throw Error('invalid_private_pilot_config');
const bot=new Telegraf(token);
const boundary=createKitchenMcpDispatchBoundary({
 releaseEnabled:true,callTool:createKitchenMcpClient({lanMvp:true,ownerApprovedLanHttpPilot:true}),
 verifyAdmission:createKitchenLiveAdmission({expectedSha256:'a12580eb40a0e40833fbccb631e3aaa01d57159f43ea5cc88426c1ebce48e85a'})
});
// Deployment-owned, pre-provisioned journal outside the rollback checkout.
// Absent or untrusted storage must disable physical dispatch, not create a fresh DB.
const claimsPath='/home/drpoh/.local/state/rs-home-ai-v3/claims.db';
const storage=prepareV3PilotExecutionJournal({dbPath:claimsPath,rollbackRoot:'/home/drpoh/rs-home-ai-v3'});
const executionJournal=storage.journal;
const saunaRead=createKitchenMcpClient({lanMvp:true,ownerApprovedLanHttpPilot:true});
const pilot=createKitchenDryrunConsent({
 executionJournal,
 dispatch:({action})=>boundary.dispatch({action})
});
const actor=ctx=>({userId:ctx.from.id,chatId:ctx.chat.id});
const lightFollowups=createPinnedLightFollowups();
const allow=ctx=>ctx.chat?.type==='private'&&ctx.chat?.id===userId&&ctx.from?.id===userId;
bot.start(ctx=>allow(ctx)?ctx.reply('RS Home AI v3: пилот тамбура. Команды только для light.tambur_svet_l1 и только после /confirm.'):undefined);
bot.command('status',ctx=>allow(ctx)?ctx.reply(storage.ready?'RS Home AI v3: защищённый журнал доступен. Для реальной команды требуется /confirm и проверка разрешений.':'RS Home AI v3: исполнение заблокировано — защищённый журнал не готов. HA не затронут.'):undefined);
bot.command('confirm',async ctx=>{
 if(!allow(ctx))return;
 const result=await pilot.confirm(actor(ctx));
 return ctx.reply(result.status==='missing'?'Нет действующего запроса для подтверждения.':result.status==='verified'?'Home Assistant подтвердил состояние светильника после команды.':result.status==='unverified'?'Команда отправлена, но итоговое состояние не подтверждено: '+result.reason:result.reason==='replay_claim_unavailable'?'Команда заблокирована: защищённый журнал подтверждений недоступен.':'Команда не выполнена или результат неизвестен: '+(result.reason||result.status));
});
bot.command('cancel',ctx=>allow(ctx)?ctx.reply(pilot.cancel(actor(ctx))?'Запрос отменён.':'Активного запроса нет.'):undefined);
bot.command('lights',async ctx=>{
 if(!allow(ctx))return;
 const result=await summarizeLightOverview({readState:id=>saunaRead('ha_get_state',{entity_id:id})});
 return ctx.reply(result.text);
});
bot.command('light',async ctx=>{
 if(!allow(ctx))return;
 const result=await summarizeTambourLight({readState:id=>saunaRead('ha_get_state',{entity_id:id})});
 return ctx.reply(result.text);
});
bot.command('sauna',async ctx=>{
 if(!allow(ctx))return;
 const result=await summarizeSauna({readState:id=>saunaRead('ha_get_state',{entity_id:id})});
 return ctx.reply(result.text);
});
bot.on('message',async ctx=>{
 if(!allow(ctx))return;
 if(typeof ctx.message?.text!=='string'||!ctx.message.text.trim())return;
 const followup=await lightFollowups.route({
  actor:actor(ctx),text:ctx.message.text,
  readState:id=>saunaRead('ha_get_state',{entity_id:id}),
  readKitchenState:id=>saunaRead('ha_get_state',{entity_id:id})
 });
 if(followup.handled)return ctx.reply(followup.text);
 const intent=classifyReadonlyQuestion(ctx.message.text);
 const replyRead=promise=>promise.then(result=>{
  lightFollowups.remember({actor:actor(ctx),text:ctx.message.text,answer:result});
  return ctx.reply(result.text);
 });
 if(intent==='sauna')return replyRead(summarizeSauna({readState:id=>saunaRead('ha_get_state',{entity_id:id})}));
 if(intent==='lights')return replyRead(summarizeLightOverview({readState:id=>saunaRead('ha_get_state',{entity_id:id})}));
 if(intent==='tambour')return replyRead(summarizeTambourLight({readState:id=>saunaRead('ha_get_state',{entity_id:id})}));
 if(intent==='corridor')return replyRead(summarizeCorridorLights({readState:id=>saunaRead('ha_get_state',{entity_id:id})}));
 if(intent==='kitchen_review')return replyRead(summarizeReviewedKitchenLights({readState:id=>saunaRead('ha_get_state',{entity_id:id})}));
 if(intent==='unsupported_question'){
  lightFollowups.clear(actor(ctx));
  return ctx.reply('Этот вопрос пока не поддерживается. Доступны температура сауны, свет в тамбуре и обзор выбранных светильников.');
 }
 lightFollowups.clear(actor(ctx));
 const r=pilot.request(actor(ctx),ctx.message?.text);
 return ctx.reply(r.status==='pending'?'Цель: light.tambur_svet_l1. Действие: '+(ctx.message.text.toLowerCase().startsWith('включи')?'ВКЛЮЧИТЬ':'ВЫКЛЮЧИТЬ')+'. Для РЕАЛЬНОГО переключения отправь /confirm в течение 60 секунд либо /cancel.':'Режим тестирования. Попробуй: «Включи свет в тамбуре» или «Выключи свет в тамбуре».');
});
bot.catch(e=>console.error('telegram_handler_error',e?.name||'Error'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
process.once('SIGINT',()=>bot.stop('SIGINT'));
await bot.launch({dropPendingUpdates:true});
console.log('RS_HOME_AI_V3_READONLY_READY');
