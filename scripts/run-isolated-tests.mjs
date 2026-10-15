import {readdirSync,mkdtempSync,rmSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync,spawn} from "node:child_process";

const allFiles=readdirSync("test").filter(f=>f.endsWith(".test.mjs")).sort();
const filter=process.argv[2] || "";
const files=filter ? allFiles.filter(f=>f.includes(filter)) : allFiles;
if (!files.length) {
 console.error("No test files match filter");
 process.exit(2);
}
const progress=(done,total)=> {
 const width=20;
 const filled=Math.floor(done*width/total);
 const bar="█".repeat(filled)+"░".repeat(width-filled);
 process.stdout.write("\r["+bar+"] "+Math.floor(done*100/total)+"% ("+done+"/"+total+")");
 if(done===total)process.stdout.write("\n");
};
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
let next=0,failed=0,passed=0,completed=0;
progress(0,files.length);
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
   const pass=Number(output.text.match(/# pass (\d+)/)?.[1]||0);
   passed+=pass;
   completed++;
   progress(completed, files.length);
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
