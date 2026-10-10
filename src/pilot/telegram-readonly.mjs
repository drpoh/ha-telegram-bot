import {readFileSync} from 'node:fs';
import {Telegraf} from 'telegraf';
import {createKitchenDryrunConsent} from './kitchen-dryrun-consent.mjs';
import {createKitchenMcpDispatchBoundary} from './kitchen-mcp-dispatch-boundary.mjs';
import {createKitchenLiveAdmission} from './kitchen-live-admission.mjs';
import {createKitchenMcpClient} from './kitchen-mcp-client.mjs';
import {inspectV3PilotStorage} from '../ops/v3-pilot-storage-preflight.mjs';
import {createGateCExecutionJournal} from '../decision/v3-gate-c-execution-journal.mjs';
const base='/home/drpoh/.config/rs-home-ai-v3/';
const token=readFileSync(base+'telegram-token','utf8').trim();
const userId=Number(readFileSync(base+'allowed-user-id','utf8').trim());
if(!/^\d+:[A-Za-z0-9_-]{30,}$/.test(token)||!Number.isSafeInteger(userId)||userId<=0)throw Error('invalid_private_pilot_config');
const bot=new Telegraf(token);
const boundary=createKitchenMcpDispatchBoundary({
 releaseEnabled:true,callTool:createKitchenMcpClient(),
 verifyAdmission:createKitchenLiveAdmission({expectedSha256:'32843f881dbca7a24f205ac6a678b67463486033c581d859ac764b0c54c1091f'})
});
// Deployment-owned, pre-provisioned journal outside the rollback checkout.
// Absent or untrusted storage must disable physical dispatch, not create a fresh DB.
const claimsPath='/home/drpoh/.local/state/rs-home-ai-v3/claims.db';
const storage=inspectV3PilotStorage({dbPath:claimsPath,rollbackRoot:'/home/drpoh/rs-home-ai-v3'});
const executionJournal=storage.ready
 ? createGateCExecutionJournal({dbPath:claimsPath})
 : Object.freeze({claim:()=>false});
const pilot=createKitchenDryrunConsent({
 executionJournal,
 dispatch:({action})=>boundary.dispatch({action})
});
const actor=ctx=>({userId:ctx.from.id,chatId:ctx.chat.id});
const allow=ctx=>ctx.chat?.type==='private'&&ctx.chat?.id===userId&&ctx.from?.id===userId;
bot.start(ctx=>allow(ctx)?ctx.reply('RS Home AI v3: кухонный пилот. Команды только для light.led_kukhnia и только после /confirm.'):undefined);
bot.command('status',ctx=>allow(ctx)?ctx.reply(storage.ready?'RS Home AI v3: защищённый журнал доступен. Для реальной команды требуется /confirm и проверка разрешений.':'RS Home AI v3: исполнение заблокировано — защищённый журнал не готов. HA не затронут.'):undefined);
bot.command('confirm',async ctx=>{
 if(!allow(ctx))return;
 const result=await pilot.confirm(actor(ctx));
 return ctx.reply(result.status==='missing'?'Нет действующего запроса для подтверждения.':result.status==='verified'?'Home Assistant подтвердил состояние светильника после команды.':result.status==='unverified'?'Команда отправлена, но итоговое состояние не подтверждено: '+result.reason:result.reason==='replay_claim_unavailable'?'Команда заблокирована: защищённый журнал подтверждений недоступен.':'Команда не выполнена или результат неизвестен: '+(result.reason||result.status));
});
bot.command('cancel',ctx=>allow(ctx)?ctx.reply(pilot.cancel(actor(ctx))?'Запрос отменён.':'Активного запроса нет.'):undefined);
bot.on('message',ctx=>{
 if(!allow(ctx))return;
 const r=pilot.request(actor(ctx),ctx.message?.text);
 return ctx.reply(r.status==='pending'?'Цель: light.led_kukhnia. Действие: '+(ctx.message.text.toLowerCase().startsWith('включи')?'ВКЛЮЧИТЬ':'ВЫКЛЮЧИТЬ')+'. Для РЕАЛЬНОГО переключения отправь /confirm в течение 60 секунд либо /cancel.':'Режим тестирования. Попробуй: «Включи свет на кухне» или «Выключи свет на кухне».');
});
bot.catch(e=>console.error('telegram_handler_error',e?.name||'Error'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
process.once('SIGINT',()=>bot.stop('SIGINT'));
await bot.launch({dropPendingUpdates:true});
console.log('RS_HOME_AI_V3_READONLY_READY');
