#!/usr/bin/env node
// Portable Node 20 syntax checks for the same src/test *.mjs files as the former
// "find ... | xargs node --check". Progress is terminal-friendly, CI-safe and offline.
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {createTestProgress} from './testing/test-progress.mjs';

function collectMjs(dir,output){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())collectMjs(path,output);
  else if(entry.isFile()&&entry.name.endsWith('.mjs'))output.push(path);
 }
}

let files=[];
try{
 collectMjs('src',files);
 collectMjs('test',files);
 files.sort();
 if(files.length===0)throw Error('No source or test files');
}catch{
 console.error('Syntax check setup failed: src/test missing or unreadable');
 process.exitCode=1;
}
if(process.exitCode!==1){
 let next=0,done=0,failed=0;
 const progress=createTestProgress({label:'syntax',total:files.length});
 try{
  const workers=Array.from({length:3},async()=>{
   while(next<files.length){
    const path=files[next++];
    const result=await new Promise(resolve=>{
     const child=spawn(process.execPath,['--check',path],{
      stdio:['ignore','pipe','pipe'],
     });
     let output='';
     const add=chunk=>{if(output.length<3000)output+=String(chunk).slice(0,3000-output.length);};
     child.stdout.on('data',add);
     child.stderr.on('data',add);
     child.on('error',err=>resolve({code:1,output:String(err?.message??'spawn_error')}));
     child.on('close',code=>resolve({code,output}));
    });
    done++;
    if(result.code!==0){
     failed++;
     progress.clearLine();
     console.error('SYNTAX_FAIL',path,'\n',result.output.slice(-3000));
    }
    progress.update({done,errors:failed});
   }
  });
  await Promise.all(workers);
 }finally{progress.finish({done,errors:failed});}
 console.log('Syntax check files:',files.length,'failed files:',failed);
 if(failed)process.exitCode=1;
}
