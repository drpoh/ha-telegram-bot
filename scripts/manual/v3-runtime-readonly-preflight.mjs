#!/usr/bin/env node
// Operator-invoked one-shot read-only inspection of local systemd and /proc.
// Never outputs full cmdlines, service environments, Telegram tokens or URLs.
import {execFileSync} from 'node:child_process';
import {readdirSync,readFileSync,readlinkSync} from 'node:fs';
import {basename} from 'node:path';
import {assessLocalRuntime,parseUnitMainPid,resolveNodeScript} from '../../src/ops/gate-d-runtime-review.mjs';

const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--readonly'||args[1]!=='--operator-approved'){
 console.error('USAGE: node scripts/manual/v3-runtime-readonly-preflight.mjs --readonly --operator-approved');
 process.exitCode=2;
}else{
 const uid=process.getuid?.()??1000;
 const env={...process.env,
  XDG_RUNTIME_DIR:`/run/user/${uid}`,
  DBUS_SESSION_BUS_ADDRESS:`unix:path=/run/user/${uid}/bus`
 };
 const readUnit=(name,user)=>{
  try{
   const output=execFileSync('/usr/bin/systemctl',[
    ...(user?['--user']:[]),'show',name,
    '--property=ActiveState,MainPID','--no-pager'
   ],{encoding:'utf8',timeout:5000,maxBuffer:8192,
    env,stdio:['ignore','pipe','pipe']});
   return parseUnitMainPid(output);
  }catch{return {active:false,pid:null,available:false};}
 };
 const v2Unit=readUnit('ha-telegram-bot.service',false);
 const v3Unit=readUnit('rs-home-ai-v3.service',true);
 const processes=[];
 let unreadable=0;
 try{
  for(const pidText of readdirSync('/proc').filter(s=>/^[0-9]+$/.test(s))){
   const pid=Number(pidText);
   if(!Number.isSafeInteger(pid)||pid<=0)continue;
   try{
    const raw=readFileSync(`/proc/${pid}/cmdline`,'utf8');
    const argv=raw.split('\0').filter(Boolean);
    const command=basename(argv[0]??'');
    if(command!=='node'&&command!=='nodejs')continue;
    const cwd=readlinkSync(`/proc/${pid}/cwd`);
    const entrypoint=resolveNodeScript({argv,cwd});
    if(entrypoint)processes.push({pid,entrypoint});
   }catch(e){
    // Processes exiting during the scan are expected; permission barriers
    // reduce confidence in local-duplicate detection, never count as clean.
    if(e?.code==='EACCES'||e?.code==='EPERM')unreadable++;
   }
  }
 }catch{unreadable++;}
 const result=assessLocalRuntime({v2Unit,v3Unit,processes,unreadable});
 console.log('GATE_D_RUNTIME_READONLY='+result.status);
 console.log('V2_SERVICE_ACTIVE='+result.v2Active);
 console.log('V3_SERVICE_ACTIVE='+result.v3Active);
 console.log('V2_MAINPID='+ (result.v2MainPid??'UNAVAILABLE'));
 console.log('V3_MAINPID='+ (result.v3MainPid??'UNAVAILABLE'));
 console.log('V2_MAIN_ENTRYPOINT_MATCH='+result.v2MainEntrypointMatches);
 console.log('V3_MAIN_ENTRYPOINT_MATCH='+result.v3MainEntrypointMatches);
 console.log('SERVICE_PIDS_DISTINCT='+result.distinctServicePids);
 console.log('KNOWN_ENTRYPOINT_PROCESS_COUNTS='+JSON.stringify({
  v2:result.v2LocalEntrypointCount,v3:result.v3LocalEntrypointCount,
  unreadable:result.unreadableProcessCount
 }));
 console.log('KNOWN_ENTRYPOINT_DUPLICATE_OBSERVED='+result.duplicateEntrypointObserved);
 console.log('TELEGRAM_TOKEN_POLLER_UNIQUENESS_VERIFIED=false');
 console.log('DEPENDENCIES_AND_ROLLBACK_VERIFIED=false');
 console.log('HA_WRITE_ATTEMPTED=false');
 process.exitCode=result.status==='PASS'?0:1;
}
