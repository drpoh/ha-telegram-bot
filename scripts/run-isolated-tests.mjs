import {readdirSync,mkdtempSync,rmSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync,spawn} from "node:child_process";

const allFiles=readdirSync("test").filter(f=>f.endsWith(".test.mjs")).sort();
const selected=process.argv.slice(2).map(x=>x.replace(/^test\//,""));
const files=selected.length ? allFiles.filter(f=>selected.includes(f)) : allFiles;
if(selected.length && files.length!==new Set(selected).size) throw Error("Unknown or duplicate selected test file");
const schema=readFileSync("test/fixtures/bot-schema.sql","utf8");
if(!schema.includes("CREATE TABLE")) throw Error("SQLite schema unavailable");
const root=mkdtempSync(join(tmpdir(),"ha-bot-test-"));
// No production keys or inherited MCP endpoints enter isolated test processes.
const testEnv={
 PATH:process.env.PATH || "/usr/bin:/bin",
 HOME:root,
 TMPDIR:root,
 LANG:"C.UTF-8",
 TELEGRAM_BOT_TOKEN:"offline-test-token",
 TELEGRAM_ALLOWED_USER_ID:"123456",
 GEMINI_API_KEY:"offline-test-key",
 MCP_URL:"http://127.0.0.1:1/mcp",
 HTTP_PORT:"0",
};
let next=0,failed=0,passed=0,finished=0;
function report(){const bars=Math.round(20*finished/files.length);process.stdout.write(`\r[${"█".repeat(bars)}${"░".repeat(20-bars)}] ${Math.round(100*finished/files.length)}% (${finished}/${files.length})`);if(finished===files.length)process.stdout.write("\n");}
try{
 const jobs=Array.from({length:3},async()=>{
  while(next<files.length){
   const index=next++;
   const file=files[index];
   const db=join(root,"test-"+index+".db");
   execFileSync("sqlite3",[db],{input:schema,encoding:"utf8"});
   const output=await new Promise((done)=>{
    const child=spawn(process.execPath,["--test",join("test",file)],{
     env:{...testEnv,HA_BOT_DB_PATH:db},stdio:["ignore","pipe","pipe"],
    });
    let text="";
    child.stdout.on("data",chunk=>text+=chunk);
    child.stderr.on("data",chunk=>text+=chunk);
    child.on("error",error=>done({exit:1,text:String(error)}));
    child.on("close",exit=>done({exit,text}));
   });
   finished++;report();
   const pass=Number(output.text.match(/# pass (\d+)/)?.[1]||0);
   passed+=pass;
   if(output.exit!==0){
    failed++;
    console.error("FAIL",file,"\n",output.text.slice(-3000));
   }
  }
 });
 await Promise.all(jobs);
 console.log("Isolated test files:",files.length,"passed assertions:",passed,"failed files:",failed);
 if(failed)process.exitCode=1;
}finally{
 rmSync(root,{recursive:true,force:true});
}
