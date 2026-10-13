import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 EXPECTED_V2,EXPECTED_V3,parseUnitMainPid,
 resolveNodeScript,assessLocalRuntime
} from '../src/ops/gate-d-runtime-review.mjs';

const active=pid=>`ActiveState=active\nMainPID=${pid}\n`;
const proc=(pid,entrypoint)=>({pid,entrypoint});
const observed=[proc(901,EXPECTED_V2),proc(920,EXPECTED_V3)];
const opts={v2Unit:active(901),v3Unit:active(920),processes:observed};

test('read-only Gate D can identify two distinct expected systemd main process entrypoints',()=>{
 const result=assessLocalRuntime(opts);
 assert.equal(result.status,'PASS');
 assert.equal(result.v2Active,true);assert.equal(result.v3Active,true);
 assert.equal(result.v2MainPid,901);assert.equal(result.v3MainPid,920);
 assert.equal(result.v2MainEntrypointMatches,true);
 assert.equal(result.v3MainEntrypointMatches,true);
 assert.equal(result.distinctServicePids,true);
 assert.equal(result.v2LocalEntrypointCount,1);
 assert.equal(result.v3LocalEntrypointCount,1);
 assert.equal(result.telegramTokenPollerUniquenessVerified,false);
 assert.equal(result.rollbackExecuted,false);assert.equal(result.actualWrite,false);
});

test('systemd inactive, missing MainPID, entrypoint mismatch and shared pid fail closed',()=>{
 const scenarios=[
  {...opts,v2Unit:'ActiveState=inactive\nMainPID=901\n'},
  {...opts,v3Unit:'ActiveState=active\nMainPID=0\n'},
  {...opts,v3Unit:active(901)},
  {...opts,processes:[proc(901,EXPECTED_V2),proc(920,'/tmp/unknown.mjs')]}
 ];
 for(const input of scenarios){
  const result=assessLocalRuntime(input);
  assert.equal(result.status,'UNVERIFIED');
  assert.equal(result.actualWrite,false);
 }
 assert.deepEqual(parseUnitMainPid('ActiveState=active\nMainPID=not-a-pid\n'),{
  active:true,pid:null,available:true
 });
});

test('duplicate known local entrypoints are detected without implying token-level proof',()=>{
 const result=assessLocalRuntime({
  ...opts,processes:[...observed,proc(3300,EXPECTED_V3)]
 });
 assert.equal(result.status,'UNVERIFIED');
 assert.equal(result.duplicateEntrypointObserved,true);
 assert.equal(result.v3LocalEntrypointCount,2);
 assert.equal(result.telegramTokenPollerUniquenessVerified,false);
});

test('permission-limited process scan is PARTIAL not a false PASS',()=>{
 const result=assessLocalRuntime({...opts,unreadable:2});
 assert.equal(result.status,'PARTIAL');
 assert.equal(result.unreadableProcessCount,2);
 assert.equal(result.telegramTokenPollerUniquenessVerified,false);
});

test('Node process resolver rejects unrelated processes and resolves relative scripts',()=>{
 assert.equal(resolveNodeScript({
  argv:['/usr/bin/node','src/index.mjs'],cwd:'/home/drpoh/ha-telegram-bot'
 }),EXPECTED_V2);
 assert.equal(resolveNodeScript({
  argv:['node','--no-warnings',EXPECTED_V3],cwd:'/tmp'
 }),EXPECTED_V3);
 for(const input of [
  {argv:['bash','-lc','node bot.mjs'],cwd:'/tmp'},
  {argv:['node','-e','console.log(1)'],cwd:'/tmp'},
  {argv:['node','--test','test/foo.test.js'],cwd:'/tmp'},
  {argv:['node','src/index.mjs'],cwd:'relative'},
  {argv:[],cwd:'/tmp'}
 ])assert.equal(resolveNodeScript(input),null);
});

test('script never starts, stops or inspects secrets; prints bounded status only',()=>{
 const src=readFileSync(new URL('../scripts/manual/v3-runtime-readonly-preflight.mjs',import.meta.url),'utf8');
 assert.match(src,/--readonly/);
 assert.match(src,/--operator-approved/);
 assert.match(src,/systemctl/);
 assert.match(src,/--property=ActiveState,MainPID/);
 assert.match(src,/\/proc\/\$\{pid\}\/cmdline/);
 assert.match(src,/TELEGRAM_TOKEN_POLLER_UNIQUENESS_VERIFIED=false/);
 assert.match(src,/HA_WRITE_ATTEMPTED=false/);
 assert.doesNotMatch(src,/ha_call_service|bot\.launch\(|\.startPolling\(|'restart'|'stop'|'start'|writeFileSync|appendFileSync/);
 assert.doesNotMatch(src,/console\.log\([^\n]*(?:raw|argv|cwd|process\.env)/);
});
