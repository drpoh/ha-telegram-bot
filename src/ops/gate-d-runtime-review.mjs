// Pure local-only Gate D runtime classifier. Does not connect to Telegram or HA.
// Trusted evidence is limited to systemd MainPID and /proc argv of this Pi.
// Process argv is NEVER included in output; token-based poller uniqueness is NOT proven.
import {basename,isAbsolute,resolve} from 'node:path';

export const EXPECTED_V2='/home/drpoh/ha-telegram-bot/src/index.mjs';
export const EXPECTED_V3='/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs';

export function parseUnitMainPid(raw){
 if(typeof raw!=='string')return {active:false,pid:null,available:false};
 const fields=Object.fromEntries(raw.split('\n').filter(x=>x.includes('=')).map(x=>{
  const index=x.indexOf('=');
  return [x.slice(0,index),x.slice(index+1)];
 }));
 const value=fields.MainPID;
 const pid=/^[0-9]+$/.test(value??'')?Number(value):0;
 return {active:fields.ActiveState==='active',pid:Number.isSafeInteger(pid)&&pid>0?pid:null,available:true};
}

export function resolveNodeScript({argv,cwd}={}){
 if(!Array.isArray(argv)||typeof cwd!=='string'||!isAbsolute(cwd))return null;
 const executable=basename(argv[0]??'');
 if(executable!=='node'&&executable!=='nodejs')return null;
 // Inline --eval, -e, -p, -r etc are not known entrypoints.
 // Ignore switches; accept only .mjs module-path arguments.
 const path=argv.slice(1).find(arg=>typeof arg==='string'&&!arg.startsWith('-')&&/\.mjs$/.test(arg));
 return path?(isAbsolute(path)?resolve(path):resolve(cwd,path)):null;
}

export function assessLocalRuntime({
 v2Unit,v3Unit,processes=[],unreadable=0,
 expectedV2=EXPECTED_V2,expectedV3=EXPECTED_V3
}={}){
 const v2=typeof v2Unit==='string'?parseUnitMainPid(v2Unit):v2Unit;
 const v3=typeof v3Unit==='string'?parseUnitMainPid(v3Unit):v3Unit;
 const entries=processes.filter(p=>p&&Number.isSafeInteger(p.pid)&&p.pid>0);
 const byEntry=path=>entries.filter(p=>p.entrypoint===path);
 const matchesV2=byEntry(expectedV2);
 const matchesV3=byEntry(expectedV3);
 const validUnit=(unit,proc,expected)=>Boolean(unit?.available&&unit?.active&&
  Number.isSafeInteger(unit.pid)&&unit.pid>0&&
  proc.some(p=>p.pid===unit.pid&&p.entrypoint===expected));
 const v2Match=validUnit(v2,matchesV2,expectedV2);
 const v3Match=validUnit(v3,matchesV3,expectedV3);
 const distinct=Boolean(v2?.pid&&v3?.pid&&v2.pid!==v3.pid);
 const duplicate=matchesV2.length>1||matchesV3.length>1;
 const checked=v2Match&&v3Match&&distinct&&!duplicate;
 // Local scan cannot prove uniqueness of a Telegram token's long-polling sessions.
 const status=!checked?'UNVERIFIED':unreadable>0?'PARTIAL':'PASS';
 return {
  status,
  v2Active:Boolean(v2?.active),
  v3Active:Boolean(v3?.active),
  v2MainPid:Number.isSafeInteger(v2?.pid)?v2.pid:null,
  v3MainPid:Number.isSafeInteger(v3?.pid)?v3.pid:null,
  v2MainEntrypointMatches:v2Match,
  v3MainEntrypointMatches:v3Match,
  distinctServicePids:distinct,
  v2LocalEntrypointCount:matchesV2.length,
  v3LocalEntrypointCount:matchesV3.length,
  duplicateEntrypointObserved:duplicate,
  unreadableProcessCount:Math.max(0,Number(unreadable)||0),
  processSource:'systemd_and_proc',
  telegramTokenPollerUniquenessVerified:false,
  dependenciesVerified:false,
  rollbackExecuted:false,
  actualWrite:false
 };
}
