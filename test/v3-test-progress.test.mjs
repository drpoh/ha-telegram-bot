import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTestProgress,formatTestProgress} from '../scripts/testing/test-progress.mjs';

function fakeStream(isTTY=false,columns=80){
 const writes=[];
 return {isTTY,columns,writes,write:s=>{writes.push(s);return true;}};
}

test('Termux TTY progress is a compact single-line display with bounded width',()=>{
 assert.equal(formatTestProgress({
  label:'isolated',total:10,completed:5,failed:1,elapsedMs:2520,tty:true,columns:80
 }), 'T [####....] 5/10 50% !1 2s');
 assert.equal(formatTestProgress({
  label:'syntax',total:4,completed:4,elapsedMs:1000,tty:true,columns:80
 }), 'S [########] 4/4 100% 1s');
 for(const columns of [15,20,25,32,40,80]){
  const row=formatTestProgress({
   label:'isolated',total:211,completed:199,failed:0,elapsedMs:25000,tty:true,columns
  });
  assert.ok(row.length<=columns-2,`wrapped terminal width ${columns}: ${row}`);
  assert.doesNotMatch(row,/[\r\n\x1b]/);
 }
});

test('TTY updates only one row with carriage return, never ANSI; stage ends once',()=>{
 const stream=fakeStream(true,40);
 let time=0;
 const progress=createTestProgress({
  label:'isolated',total:4,stream,env:{CI:'false',TERM:'xterm'},
  now:()=>time,heartbeatMs:0
 });
 time=900;
 progress.update({done:2});
 time=1100;
 progress.update({done:3,errors:1});
 progress.clearLine();
 time=1400;
 progress.finish({done:4,errors:1});
 progress.finish({done:4,errors:1});
 const output=stream.writes.join('');
 assert.match(output,/\rT \[####....\] 2\/4 50% 0s/);
 assert.match(output,/!1/);
 assert.match(output,/4\/4 100%/);
 assert.ok(output.endsWith('\n'));
 assert.equal((output.match(/4\/4 100%/g)||[]).length,1);
 assert.doesNotMatch(output,/\x1b/);
 assert.equal(output.split('\n').length,2,'Only one actual terminal line');
 assert.ok(stream.writes.every(part=>part.split('\r').every(row=>row.length<=38)));
});

test('TTY throttles intermediate redrawing to 5 percent buckets',()=>{
 const stream=fakeStream(true,40);
 let time=0;
 const progress=createTestProgress({label:'isolated',total:200,stream,env:{TERM:'xterm'},now:()=>time,heartbeatMs:0});
 for(let done=1;done<=200;done++){
  time+=5;
  progress.update({done});
 }
 progress.finish({done:200});
 assert.ok(stream.writes.length<=25,`Too many terminal writes: ${stream.writes.length}`);
 assert.equal(stream.writes.join('').split('\n').length,2);
});

test('CI emits sparse text checkpoints without ANSI or carriage returns',()=>{
 const stream=fakeStream(false);
 let time=0;
 const progress=createTestProgress({label:'isolated',total:20,stream,env:{CI:'true'},now:()=>time,heartbeatMs:0});
 for(let done=1;done<=20;done++){
  time+=150;
  progress.update({done});
 }
 progress.finish({done:20});
 const lines=stream.writes.join('').trim().split('\n');
 assert.ok(lines.length>=10&&lines.length<=13,JSON.stringify(lines));
 assert.match(lines[0],/^TEST_PROGRESS isolated 0\/20 \(0%\)/);
 assert.match(lines.at(-1),/20\/20 \(100%\)/);
 assert.ok(lines.every(line=>!/[\r\x1b]/.test(line)));
 assert.ok(lines.every(line=>line.includes('failed=')&&line.includes('elapsed=')));
});

test('local non-TTY pipes print start/end, not dozens of checkpoints',()=>{
 const stream=fakeStream(false);
 let time=0;
 const progress=createTestProgress({label:'isolated',total:211,stream,env:{CI:'false'},now:()=>time,heartbeatMs:0});
 for(let done=1;done<=211;done++){
  time+=20;
  progress.update({done});
 }
 progress.finish({done:211});
 const lines=stream.writes.join('').trim().split('\n');
 assert.equal(lines.length,2);
 assert.match(lines[0],/0\/211/);
 assert.match(lines[1],/211\/211 \(100%\)/);
});

test('non-TTY CI heartbeat and failure checkpoint remain visible',()=>{
 const stream=fakeStream(false);
 let time=0;
 const progress=createTestProgress({label:'syntax',total:10,stream,env:{CI:'true'},now:()=>time,heartbeatMs:0});
 time=21000;progress.update({done:0});
 time=21001;progress.update({done:1,errors:1});
 progress.finish({done:1,errors:1});
 const lines=stream.writes.join('').trim().split('\n');
 assert.equal(lines.length,3);
 assert.match(lines[1],/0\/10 \(0%\).*elapsed=21s/);
 assert.match(lines[2],/1\/10 \(10%\).*failed=1/);
});

test('progress opt-out produces no writes, percent clamps invalid values',()=>{
 const stream=fakeStream(true);
 const p=createTestProgress({label:'isolated',total:2,stream,env:{RS_TEST_PROGRESS:'off'},heartbeatMs:0});
 p.update({done:1});p.finish({done:2});
 assert.deepEqual(stream.writes,[]);
 assert.match(formatTestProgress({label:'syntax',total:2,completed:100,failed:-4}),/2\/2 \(100%\) failed=0/);
});

test('npm test preserves full suite, compact reporter and zero additional packages',()=>{
 const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
 const syntax=readFileSync(new URL('../scripts/check-syntax.mjs',import.meta.url),'utf8');
 const isolated=readFileSync(new URL('../scripts/run-isolated-tests.mjs',import.meta.url),'utf8');
 assert.equal(pkg.scripts.check,'node scripts/check-syntax.mjs');
 assert.equal(pkg.scripts.test,'npm run check && node scripts/run-isolated-tests.mjs');
 assert.match(syntax,/createTestProgress\(\{label:'syntax'/);
 assert.match(isolated,/createTestProgress\(\{label:'isolated'/);
 assert.match(isolated,/Isolated test files:/);
 assert.match(syntax,/Syntax check files:/);
 assert.match(syntax,/length:3/);
 assert.match(isolated,/length:3/);
 assert.ok(!pkg.dependencies['cli-progress']&&!pkg.dependencies['ora']);
});
