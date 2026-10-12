#!/usr/bin/env node
// Event-only notifier. Default is dry-run; explicit --send required.
import {readFileSync,mkdirSync,openSync,writeSync,closeSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {alertText,eventId,unsentEvents} from '../src/ops/gate-d-alerts.mjs';
const root=join(homedir(),'.local/state/rs-home-ai-v3');
const eventPath=join(root,'gate-d-events.jsonl');
const sentPath=join(root,'gate-d-alert-attempts.jsonl');
function readLines(path){try{return readFileSync(path,'utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
const events=readLines(eventPath);
const attempted=readLines(sentPath);
const unsent=unsentEvents(events,new Set(attempted.map(e=>e.id)));
const send=process.argv.includes('--send');
if(!send){console.log(JSON.stringify({mode:'dry-run',pending:unsent.length}));process.exit(0);}
if(!unsent.length){console.log(JSON.stringify({mode:'send',pending:0}));process.exit(0);}
const config=join(homedir(),'.config/rs-home-ai-v3');
const token=readFileSync(join(config,'telegram-token'),'utf8').trim();
const chat=readFileSync(join(config,'allowed-user-id'),'utf8').trim();
if(!/^\d+:[A-Za-z0-9_-]{30,}$/.test(token)||!/^\d+$/.test(chat))throw Error('invalid_alert_config');
mkdirSync(root,{recursive:true,mode:0o700});
for(const event of unsent){
 const id=eventId(event);
 // Mark as attempted BEFORE network I/O to avoid repeated/duplicate alerts after uncertain delivery.
 attempted.push({id});
 const tmp=sentPath+'.tmp';const fd=openSync(tmp,'w',0o600);
 try{writeSync(fd,attempted.slice(-200).map(a=>JSON.stringify(a)).join('\n')+'\n');}finally{closeSync(fd);}
 renameSync(tmp,sentPath);
 try{
  const result=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({chat_id:chat,text:alertText(event),disable_notification:false}),
   signal:AbortSignal.timeout(10000),
  });
  if(!result.ok)throw Error('telegram_http_error');
  console.log(JSON.stringify({event:event.service,delivery:'accepted'}));
 }catch{
  console.log(JSON.stringify({event:event.service,delivery:'unknown_or_failed',retry:false}));
  process.exitCode=1;
 }
}
