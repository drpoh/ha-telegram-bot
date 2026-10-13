#!/usr/bin/env node
// Read-only audit of references to legacy document paths before any migration.
// Searches ONLY git-tracked source/docs; never reads untracked runtime state or secrets.
// No writing, rewriting, moving or deleting files.
import {execFileSync} from 'node:child_process';
import {readFileSync,statSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const targets=[
 'docs/CHAT-HANDOFF.md',
 'docs/WORKLOG.md',
 'docs/PROGRESS.md',
 'docs/REVIEW-2026-10-09.md',
 'docs/REVIEW-2026-10-10.md'
];
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)
 .filter(path=>/\.(?:md|mjs|js|json|ya?ml|sh)$/.test(path));
const refs=new Map(targets.map(target=>[target,[]]));
for(const path of files){
 if(targets.includes(path))continue;
 const full=resolve(root,path);
 let source;try{
  if(statSync(full).size>1_000_000)continue;
  source=readFileSync(full,'utf8');
 }catch{continue;}
 const lines=source.split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  for(const target of targets){
   const basename=target.split('/').at(-1);
   if(lines[i].includes(target)||lines[i].includes(basename)){
    // Print paths/line numbers only, never source contents.
    refs.get(target).push(path+':'+(i+1));
   }
  }
 }
}
for(const target of targets){
 const entries=refs.get(target);
 console.log('DOC_REF '+target+' count='+entries.length);
 for(const entry of entries.slice(0,30))console.log('DOC_REF_LOCATION '+target+' '+entry);
 if(entries.length>30)console.log('DOC_REF_TRUNCATED '+target+' '+(entries.length-30));
}
console.log('DOC_REF_SCAN=COMPLETE files='+files.length+' targets='+targets.length);
