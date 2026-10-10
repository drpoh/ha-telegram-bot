#!/usr/bin/env node
// Read-only layout inventory. Never reads secret contents, changes services,
// moves folders, or assumes a checkout is safe to delete.
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const home=process.env.HOME;
const run=(cwd,args)=>{try{return execFileSync('git',args,{cwd,encoding:'utf8',timeout:3000,stdio:['ignore','pipe','ignore']}).trim();}catch{return null;}};
const repoPaths=['projects/rs-home-ai-dev','ha-telegram-bot','rs-home-ai-v3','vinted-sales-agent'];
for(const name of repoPaths){
 const directory=join(home,name);
 if(!existsSync(directory)){console.log(JSON.stringify({name,exists:false}));continue;}
 const status=run(directory,['status','--porcelain=v1']);
 const record={name,exists:true,git:status!==null,dirty:status===null?null:status.length>0};
 if(record.git){record.branch=run(directory,['branch','--show-current']);record.head=run(directory,['rev-parse','--short','HEAD']);record.originName=run(directory,['remote','get-url','origin'])?.replace(/^git@github.com:/,'').replace(/\.git$/,'')??null;}
 console.log(JSON.stringify(record));
}
for(const [name,path] of [
 ['v2','/etc/systemd/system/ha-telegram-bot.service'],
 ['v3',join(home,'.config/systemd/user/rs-home-ai-v3.service')],
]){
 if(!existsSync(path)){console.log(JSON.stringify({unit:name,found:false}));continue;}
 // Only show non-secret executable and working-directory fields.
 const body=readFileSync(path,'utf8');
 const fields=Object.fromEntries(body.split('\n').filter(x=>/^(WorkingDirectory|ExecStart)=/.test(x)).map(x=>{const at=x.indexOf('=');return [x.slice(0,at),x.slice(at+1)];}));
 console.log(JSON.stringify({unit:name,found:true,...fields}));
}
