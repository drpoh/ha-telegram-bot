import {readdirSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync,spawn} from "node:child_process";

const files=readdirSync("test").filter(f=>f.endsWith(".test.mjs")).sort();
const source=resolve("data/bot.db");
const schema=execFileSync("sqlite3",["-readonly",source,".schema"],{encoding:"utf8"});
if(!schema.includes("CREATE TABLE")) throw Error("SQLite schema unavailable");
const root=mkdtempSync(join(tmpdir(),"ha-bot-test-"));
let next=0,failed=0,passed=0;
try{
 const jobs=Array.from({length:3},async()=>{
  while(next<files.length){
   const index=next++;
   const file=files[index];
   const db=join(root,"test-"+index+".db");
   execFileSync("sqlite3",[db],{input:schema,encoding:"utf8"});
   const output=await new Promise((done)=>{
    const child=spawn(process.execPath,["--test",join("test",file)],{
     env:{...process.env,HA_BOT_DB_PATH:db},stdio:["ignore","pipe","pipe"],
    });
    let text="";
    child.stdout.on("data",chunk=>text+=chunk);
    child.stderr.on("data",chunk=>text+=chunk);
    child.on("error",error=>done({exit:1,text:String(error)}));
    child.on("close",exit=>done({exit,text}));
   });
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
