import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTestProgress,formatTestProgress} from '../scripts/testing/test-progress.mjs';

function fakeStream(isTTY=false){
 const writes=[];
 return {isTTY,writes,write:s=>{writes.push(s);return true;}};
}

test('TTY progress renders a stable single-line bar with file count and elapsed seconds',()=>{
 assert.equal(
  formatTestProgress({label:'isolated',total:10,completed:5,failed:1,elapsedMs:2520,tty:true}),
  'isolated [██████████░░░░░░░░░░] 5/10 (50%)  failures: 1  2.5s'
 );
 assert.equal(
  formatTestProgress({label:'syntax',total:4,completed:4,elapsedMs:1000,tty:true}),
  'syntax [████████████████████] 4/4 (100%)  failures: 0  1.0s'
 );
});

test('terminal updates progress in-place and emits a newline at stage end',()=>{
 const stream=fakeStream(true);
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
 const text=stream.writes.join('');
 assert.match(text,/\r\x1b\[2Kisolated \[██████████░░░░░░░░░░\] 2\/4 \(50%\)/);
 assert.match(text,/failures: 1/);
 assert.match(text,/4\/4 \(100%\)/);
 assert.ok(text.endsWith('\n'));
 assert.equal((text.match(/4\/4 \(100%\)/g)||[]).length,1);
});

test('CI prints sparse text checkpoints without ANSI control codes',()=>{
 const stream=fakeStream(false);
 let time=0;
 const progress=createTestProgress({
  label:'isolated',total:20,stream,env:{CI:'true'},
  now:()=>time,heartbeatMs:0
 });
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

test('non-TTY emits heartbeat when progress stalls and immediate checkpoint after failure',()=>{
 const stream=fakeStream(false);
 let time=0;
 const progress=createTestProgress({
  label:'syntax',total:10,stream,env:{CI:'true'},now:()=>time,heartbeatMs:0
 });
 time=21000;
 progress.update({done:0});
 time=21001;
 progress.update({done:1,errors:1});
 progress.finish({done:1,errors:1});
 const lines=stream.writes.join('').trim().split('\n');
 assert.equal(lines.length,3);
 assert.match(lines[1],/0\/10 \(0%\).*elapsed=21\.0s/);
 assert.match(lines[2],/1\/10 \(10%\).*failed=1/);
});

test('opt-out produces no progress writes; output formatting clamps invalid counts',()=>{
 const stream=fakeStream(true);
 const p=createTestProgress({
  label:'isolated',total:2,stream,env:{RS_TEST_PROGRESS:'off'},heartbeatMs:0
 });
 p.update({done:1});
 p.finish({done:2});
 assert.deepEqual(stream.writes,[]);
 assert.match(formatTestProgress({label:'syntax',total:2,completed:100,failed:-4}),/2\/2 \(100%\) failed=0/);
});

test('npm test uses progress-aware syntax and isolated runners without extra dependencies',()=>{
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
