import {readFileSync} from 'node:fs';
import {Telegraf} from 'telegraf';
import {createKitchenDryrunConsent} from './kitchen-dryrun-consent.mjs';
import {createKitchenMcpDispatchBoundary} from './kitchen-mcp-dispatch-boundary.mjs';
import {createKitchenLiveAdmission} from './kitchen-live-admission.mjs';
import {createKitchenMcpClient} from './kitchen-mcp-client.mjs';
import {prepareV3PilotExecutionJournal} from '../ops/v3-pilot-execution-journal.mjs';
import {createNineLightTelegramConsent} from '../home/nine-light-telegram-consent.mjs';
import {createNewLightDispatch} from '../home/new-light-physical-dispatch.mjs';
import {RESPONDING_NEW_LIGHT_IDS} from '../home/responding-new-light-batch.mjs';
import {inspectSingleNewLight} from '../home/single-new-light-status.mjs';
import {summarizeSauna} from '../home/sauna-status.mjs';
import {summarizeTambourLight} from '../home/tambour-light-status.mjs';
import {summarizeLightOverview} from '../home/light-overview.mjs';
import {createReviewedLightReadonlyReader} from '../home/reviewed-light-readonly-client.mjs';
import {routeV3ReadonlyQuestion} from './v3-readonly-question-router.mjs';
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
const newLightRead=createReviewedLightReadonlyReader();
// New-light commands are visible in the DEV source but physically disabled until
// a separate trusted deployment review provisions exact physical target approvals.
const newLightDispatch=createNewLightDispatch({releaseEnabled:false,approvedIds:[]});
const newLightConsent=createNineLightTelegramConsent({executionJournal,dispatch:p=>newLightDispatch.dispatch(p)});
const pendingNewLights=new Set();
const pilot=createKitchenDryrunConsent({
 executionJournal,
 dispatch:({action})=>boundary.dispatch({action})
});
const actor=ctx=>({userId:ctx.from.id,chatId:ctx.chat.id});
const allow=ctx=>ctx.chat?.type==='private'&&ctx.chat?.id===userId&&ctx.from?.id===userId;
bot.start(ctx=>allow(ctx)?ctx.reply('RS Home AI v3: пилот тамбура. Команды только для light.tambur_svet_l1 и только после /confirm.'):undefined);
bot.command('status',ctx=>allow(ctx)?ctx.reply(storage.ready?'RS Home AI v3: защищённый журнал доступен. Для реальной команды требуется /confirm и проверка разрешений.':'RS Home AI v3: исполнение заблокировано — защищённый журнал не готов. HA не затронут.'):undefined);
bot.command('confirm',async ctx=>{
 if(!allow(ctx))return;
 if(pendingNewLights.delete(ctx.from.id)){
  const result=await newLightConsent.confirm(actor(ctx));
  return ctx.reply(result.status==='verified'?'Home Assistant подтвердил состояние выбранного светильника.':
   result.status==='unverified'?'Команда отправлена, состояние не подтверждено.':
   result.status==='missing'?'Запрос истёк или уже обработан.':
   'Новый свет: команда заблокирована или результат неизвестен ('+(result.reason||result.status)+').');
 }
 const result=await pilot.confirm(actor(ctx));
 return ctx.reply(result.status==='missing'?'Нет действующего запроса для подтверждения.':result.status==='verified'?'Home Assistant подтвердил состояние светильника после команды.':result.status==='unverified'?'Команда отправлена, но итоговое состояние не подтверждено: '+result.reason:result.reason==='replay_claim_unavailable'?'Команда заблокирована: защищённый журнал подтверждений недоступен.':'Команда не выполнена или результат неизвестен: '+(result.reason||result.status));
});
bot.command('cancel',ctx=>{
 if(!allow(ctx))return;
 if(pendingNewLights.delete(ctx.from.id))return ctx.reply(newLightConsent.cancel(actor(ctx)).status==='cancelled'?'Запрос отменён.':'Активного запроса нет.');
 return ctx.reply(pilot.cancel(actor(ctx))?'Запрос отменён.':'Активного запроса нет.');
});
// Source inventory is not a live HA state snapshot or a physical identity grant.
bot.command('newlights',ctx=>{
 if(!allow(ctx))return;
 return ctx.reply('💡 Девять отзывавшихся светильников для проверки:\n'+
  RESPONDING_NEW_LIGHT_IDS.map(id=>'• '+id).join('\n')+
  '\n\nСписок основан на предыдущем чтении HA; текущее состояние не проверено. Новые физические команды в этой версии НЕ включены.');
});
// Exact-ID, read-only diagnostic: no admission, no /confirm, no service calls.
bot.command('lightcheck',async ctx=>{
 if(!allow(ctx))return;
 const parts=(ctx.message?.text||'').trim().split(/\s+/);
 if(parts.length!==2)return ctx.reply('Формат: /lightcheck light.kukhnia_svet');
 const result=await inspectSingleNewLight({
  entityId:parts[1],
  readState:id=>newLightRead(id)
 });
 return ctx.reply(result.text);
});
bot.command('newlight',ctx=>{
 if(!allow(ctx))return;
 const parts=(ctx.message?.text||'').trim().split(/\s+/);
 if(parts.length!==3)return ctx.reply('Формат: /newlight light.kukhnia_svet on (или off). Затем /confirm.');
 const service=parts[2]==='on'?'turn_on':parts[2]==='off'?'turn_off':null;
 if(!service)return ctx.reply('Действие: только on или off.');
 const result=newLightConsent.request(actor(ctx),{entityId:parts[1],service});
 if(result.status!=='pending')return ctx.reply('Светильник не входит в проверенный список или команда отклонена.');
 // Never keep an older tamboor request pending alongside a new-light request.
 pilot.cancel(actor(ctx));
 pendingNewLights.add(ctx.from.id);
 return ctx.reply('Выбран '+result.entityId+'. Действие: '+parts[2]+'. Подтверди /confirm в течение 60 секунд или /cancel. Пока физическое управление новыми светильниками заблокировано до отдельного разрешения.');
});
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
 const routed=await routeV3ReadonlyQuestion({
  text:ctx.message?.text,
  readState:id=>saunaRead('ha_get_state',{entity_id:id}),
  readKitchenState:id=>newLightRead(id)
 });
 if(routed.handled)return ctx.reply(routed.text);
 // Preserve the existing separately gated tambour physical-confirmation path.
 pendingNewLights.delete(ctx.from.id);
 newLightConsent.cancel(actor(ctx));
 const r=pilot.request(actor(ctx),ctx.message?.text);
 return ctx.reply(r.status==='pending'?'Цель: light.tambur_svet_l1. Действие: '+(ctx.message.text.toLowerCase().startsWith('включи')?'ВКЛЮЧИТЬ':'ВЫКЛЮЧИТЬ')+'. Для РЕАЛЬНОГО переключения отправь /confirm в течение 60 секунд либо /cancel.':'Режим тестирования. Попробуй: «Включи свет в тамбуре» или «Выключи свет в тамбуре».');
});
bot.catch(e=>console.error('telegram_handler_error',e?.name||'Error'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
process.once('SIGINT',()=>bot.stop('SIGINT'));
await bot.launch({dropPendingUpdates:true});
console.log('RS_HOME_AI_V3_READONLY_READY');
