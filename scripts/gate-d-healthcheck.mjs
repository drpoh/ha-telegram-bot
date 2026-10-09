#!/usr/bin/env node
// Read-only service health probe. Never calls HA services or reads secret files.
import {execFileSync} from 'node:child_process';
const uid=process.getuid?.() ?? 1000;
const env={...process.env,XDG_RUNTIME_DIR:`/run/user/${uid}`,DBUS_SESSION_BUS_ADDRESS:`unix:path=/run/user/${uid}/bus`};
const checks=[
 ['v2','ha-telegram-bot.service',false],
 ['v3','rs-home-ai-v3.service',true],
 ['remote','desktop-commander-remote.service',true],
];
const status=checks.map(([name,unit,user])=>{
 const args=[...(user?['--user']:[]),'show',unit,'--property=ActiveState,UnitFileState,NRestarts,MainPID','--no-pager'];
 try{
  const raw=execFileSync('systemctl',args,{encoding:'utf8',timeout:5000,env,stdio:['ignore','pipe','pipe']});
  const values=Object.fromEntries(raw.trim().split('\n').map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
  return {name,active:values.ActiveState==='active',enabled:values.UnitFileState==='enabled',restarts:Number(values.NRestarts||0),pid:Number(values.MainPID||0)};
 }catch{return {name,active:false,enabled:false,error:'systemctl_unavailable'};}
});
const ok=status.every(c=>c.active&&c.enabled&&c.pid>0);
console.log(JSON.stringify({ok,services:status}));
if(!ok)process.exitCode=1;
