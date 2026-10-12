#!/usr/bin/env node
// Private GitHub repo: require explicit least-privilege fine-grained token.
// Returns failure on missing credentials, API outages, non-push runs, or wrong SHA.
import {readFileSync,statSync} from "node:fs";
const [sha, tokenPath]=process.argv.slice(2);
const deny=(reason)=>{console.error("CI_GATE_DENIED "+reason);process.exit(1);};
if(!/^[0-9a-f]{40}$/.test(sha||""))deny("invalid_sha");
if(!tokenPath?.startsWith("/"))deny("missing_token_file");
let token;
try{
 const st=statSync(tokenPath,{bigint:false});
 if(!st.isFile() || (st.mode&0o077)!==0 || st.uid!==process.getuid())deny("unsafe_token_file");
 token=readFileSync(tokenPath,"utf8").trim();
 if(!/^[A-Za-z0-9_]+$/.test(token)||token.length<20||token.length>300)deny("invalid_token");
}catch{deny("token_unavailable");}
const url=new URL("https://api.github.com/repos/drpoh/ha-telegram-bot/actions/workflows/v3-dev-verified-gate.yml/runs");
url.searchParams.set("branch","feature/v3-home-agent");
url.searchParams.set("event","push");
url.searchParams.set("head_sha",sha);
url.searchParams.set("per_page","30");
let data;
try{
 const response=await fetch(url,{headers:{
  Accept:"application/vnd.github+json",
  Authorization:"Bearer "+token,
  "X-GitHub-Api-Version":"2022-11-28",
  "User-Agent":"rs-home-ai-dev-verified-gate"
 },signal:AbortSignal.timeout(15000),redirect:"error"});
 if(!response.ok)deny("github_api_http_"+response.status);
 data=await response.json();
}catch{deny("github_api_unavailable");}
const matches=(data.workflow_runs||[]).filter(r=>
 r.head_sha===sha && r.event==="push" && r.head_branch==="feature/v3-home-agent" &&
 r.path?.endsWith("v3-dev-verified-gate.yml") && r.repository?.full_name==="drpoh/ha-telegram-bot");
if(matches.length===0)deny("no_verified_push_run");
const run=matches.sort((a,b)=>b.id-a.id)[0];
if(run.status!=="completed" || run.conclusion!=="success")deny("run_not_successful");
console.log("CI_GATE_PASS sha="+sha+" run_id="+run.id);
