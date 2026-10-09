#!/usr/bin/env node
// Minimal read-only health journal: only service state, no secrets/HA commands.
import {execFileSync} from 'node:child_process';
import {mkdirSync,openSync,writeSync,closeSync,readFileSync,writeFileSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {parseUnit,evaluateHealth} from '../src/ops/gate-d-health.mjs';
const uid=process.getuid?.() ?? 1000;
const env={...process.env,XDG_RUNTIME_DIR:`/run/user/${uid}`,DBUS_SESSION_BUS_ADDRESS:`unix:path=/run/user/${uid}/bus`};
const checks=[['v2','ha-telegram-bot.service',false],['v3','rs-home-ai-v3.service',true],['remote','desktop-commander-remote.service',true]];
const services=checks.map(([name,unit,user])=>{
 try{
  const args=[...(user?['--user']:[]),'show',unit,'--property=ActiveState,UnitFileState,NRestarts,MainPID','--no-pager'];
  const raw=execFileSync('/usr/bin/systemctl',args,{encoding:'utf8',timeout:5000,env,stdio:['ignore','pipe','pipe']});
  return {name,...parseUnit(raw)};
 }catch{return {name,active:false,enabled:false,error:'systemctl_unavailable'};}
});
const output={at:new Date().toISOString(),ok:evaluateHealth(services),services};
console.log(JSON.stringify(output));
if(process.argv.includes('--record')){
 const dir=join(homedir(),'.local','state','rs-home-ai-v3');
 mkdirSync(dir,{recursive:true,mode:0o700});
 const path=join(dir,'gate-d-health.jsonl');
 // Cap journal to 500 records; write only fixed schema without raw process data.
 let lines=[];
 try{lines=readFileSync(path,'utf8').trim().split('\n').filter(Boolean).slice(-499);}catch(e){if(e.code!=='ENOENT')throw e;}
 lines.push(JSON.stringify(output));
 const tmp=join(dir,'gate-d-health.jsonl.tmp');
 const fd=openSync(tmp,'w',0o600);
 try{writeSync(fd,lines.join('\n')+'\n');}finally{closeSync(fd);}
 renameSync(tmp,path);
}
if(!output.ok)process.exitCode=1;
