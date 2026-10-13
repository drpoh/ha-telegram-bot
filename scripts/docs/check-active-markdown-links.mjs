#!/usr/bin/env node
// Dependency-free, offline validation of active Markdown entrypoints.
// Historical Markdown is intentionally excluded until legacy links are reviewed.
import {existsSync, readFileSync, statSync} from 'node:fs';
import {resolve, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const active=[
 'AGENTS.md','README.md','docs/README.md','docs/CURRENT-STATE.md',
 'docs/TODO.md','docs/development/HANDOFF.md',
 'docs/development/README.md','docs/architecture/README.md',
 'docs/operator/README.md','docs/gates/README.md'
];
const failures=[];
let checked=0;
for (const rel of active){
 const source=resolve(root,rel);
 if (!existsSync(source)) {failures.push('missing document: '+rel);continue;}
 const raw=readFileSync(source,'utf8');
 if (rel==='docs/development/HANDOFF.md' && raw.split(/\r?\n/).length>150)
   failures.push(rel+': more than 150 lines');
 // Ignore triple-backtick and triple-tilde fenced code, which often includes example links.
 const markdown=raw.replace(/^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*(?:`{3,}|~{3,})\s*$/gm,'');
 for (const match of markdown.matchAll(/!?\[[^\]\n]*\]\(([^\n)]+)\)/g)){
   let href=match[1].trim().replace(/^<|>$/g,'');
   // Skip absolute web, mailto, protocol, and in-page anchors; do not fetch external URLs.
   if (!href||href.startsWith('#')||/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith('//'))continue;
   const target=decodeURIComponent(href.split('#',1)[0].split('?',1)[0]);
   if (!target)continue;
   const absolute=resolve(dirname(source),target);
   checked++;
   if (!absolute.startsWith(root+sep)||!existsSync(absolute))
     failures.push(rel+': broken relative link '+href);
 }
}
if(failures.length){
 for(const failure of failures) console.error('DOCS_FAIL '+failure);
 console.error('DOCS_CHECK=FAIL links='+checked+' errors='+failures.length);
 process.exitCode=1;
}else console.log('DOCS_CHECK=PASS files='+active.length+' links='+checked);
