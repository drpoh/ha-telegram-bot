#!/usr/bin/env node
// Offline, read-only audit of ALL git-tracked Markdown, including archived docs.
// Prints paths and counts, never document contents or secrets. No network or HA calls.
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const files=execFileSync('git',['ls-files','-z','--','*.md','*.MD'],{cwd:root,encoding:'utf8'})
 .split('\0').filter(Boolean).sort();
let links=0,failures=0,skipped=0;
const findings=[];
for(const path of files){
 const full=resolve(root,path);
 let raw;
 try{raw=readFileSync(full,'utf8');}catch{findings.push([path,'unreadable']);failures++;continue;}
 // Exclude fenced code blocks and inline code examples from Markdown link checks.
 const prose=raw.replace(/^s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*(?:`{3,}|~{3,})\s*$/gm,'')
    .replace(/`[^`\n]*`/g,'');
 for(const match of prose.matchAll(/!?\[[^\]\n]*\]\((<[^>]+>|[^\n)]+)\)/g)){
  const href=match[1].trim().replace(/^<|>$/g,'').split(/\s+["']/)[0];
  if(!href||href[0]==='#'||/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//')){skipped++;continue;}
  let target;
  try{target=decodeURIComponent(href.split('#')[0].split('?')[0]);}
  catch{findings.push([path,'invalid-url-encoding']);failures++;continue;}
  if(!target)continue;
  links++;
  const candidate=resolve(dirname(full),target);
  if(!(candidate===root||candidate.startsWith(root+sep))||!existsSync(candidate)){
   failures++;findings.push([path,'broken-or-outside-link']);
  }
 }
}
for(const [path,reason] of findings.slice(0,120))console.log('MARKDOWN_FINDING '+reason+' '+path);
if(findings.length>120)console.log('MARKDOWN_FINDINGS_TRUNCATED '+(findings.length-120));
console.log('MARKDOWN_AUDIT='+ (failures?'REVIEW':'PASS')+' files='+files.length+
 ' relative_links='+links+' skipped_external_or_anchors='+skipped+' findings='+failures);
// Historical broken references are observations, not automatic migration instructions.
// Fail only when explicitly requested for full historical remediation.
if(process.argv.includes('--strict')&&failures)process.exitCode=1;
