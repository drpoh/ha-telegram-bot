#!/usr/bin/env node
// Optional RS Pi DEV MCP bootstrap. Never start automatically or use on production.
// Only exposes a preapproved list of tracked documentation and read-only Git status.
// stdio is reserved for MCP; no logs, shell, tokens, HA or network.
import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {ListToolsRequestSchema,CallToolRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {readFileSync,realpathSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,sep} from 'node:path';
const DEFAULT_DEV='/home/drpoh/projects/rs-home-ai-dev';
const ROOT=realpathSync(process.env.RS_PI_DEV_ROOT??DEFAULT_DEV);
if(ROOT!==realpathSync(DEFAULT_DEV))throw Error('dev_workspace_mismatch');
const ALLOWED=Object.freeze([
 'AGENTS.md','docs/CURRENT-STATE.md','docs/TODO.md',
 'docs/development/HANDOFF.md','docs/PROJECT-MAP.md',
 'docs/README.md','README.md'
]);
function readDoc(path){
 if(!ALLOWED.includes(path))throw Error('document_not_allowed');
 const real=realpathSync(resolve(ROOT,path));
 if(!real.startsWith(ROOT+sep))throw Error('path_outside_dev');
 const contents=readFileSync(real,'utf8');
 return contents.slice(0,16000);
}
function git(args){
 return execFileSync('git',args,{cwd:ROOT,encoding:'utf8',timeout:8000,maxBuffer:65536,
  env:{PATH:process.env.PATH??'/usr/bin:/bin',HOME:process.env.HOME??'/nonexistent',GIT_OPTIONAL_LOCKS:'0'}}).trim();
}
const server=new Server({name:'rs-pi-dev-readonly',version:'0.1.0'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:[
 {name:'dev_git_status',description:'Read only: DEV branch, commit and working-tree status. No shell or writes.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'dev_read_document',description:'Read one specifically allowed public DEV documentation file, max 16000 characters; never secrets.',inputSchema:{type:'object',properties:{path:{type:'string',enum:[...ALLOWED]}},required:['path'],additionalProperties:false}}
]}));
server.setRequestHandler(CallToolRequestSchema,async request=>{
 const {name,arguments:args={}}=request.params;
 try{
  if(name==='dev_git_status'){
   if(Object.keys(args).length)throw Error('unexpected_argument');
   const branch=git(['branch','--show-current']);
   const commit=git(['rev-parse','HEAD']);
   const changes=git(['status','--porcelain=v1','--untracked-files=no']).split('\n').filter(Boolean);
   return {content:[{type:'text',text:JSON.stringify({branch,commit,trackedChanges:changes.length,clean:changes.length===0})}]};
  }
  if(name==='dev_read_document'){
   if(!args||Object.keys(args).length!==1)throw Error('invalid_arguments');
   return {content:[{type:'text',text:readDoc(args.path)}]};
  }
  return {isError:true,content:[{type:'text',text:'tool_not_allowed'}]};
 }catch{
  return {isError:true,content:[{type:'text',text:'read_only_tool_failed'}]};
 }
});
await server.connect(new StdioServerTransport());
