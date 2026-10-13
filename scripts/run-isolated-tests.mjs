import {readdirSync,mkdtempSync,rmSync,readFileSync,lstatSync} from "node:fs";
import {join,dirname} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync,spawn} from "node:child_process";
import {createTestProgress} from "./testing/test-progress.mjs";

const files=readdirSync("test").filter(f=>f.endsWith(".test.mjs")).sort();
const schema=readFileSync("test/fixtures/bot-schema.sql","utf8");
if(!schema.includes("CREATE TABLE")) throw Error("SQLite schema unavailable");
const root=mkdtempSync(join(tmpdir(),"ha-bot-test-"));
if(process.env.RS_DEV_TEST_DIAGNOSTIC==="1"){
 let cursor=root;
 while(true){
  const st=lstatSync(cursor);
  const safe=st.isDirectory()&&!st.isSymbolicLink()&&
    ((st.mode&0o022)===0 || (st.uid===0&&(st.mode&0o1000)!==0))&&
    (st.uid===0 || st.uid===process.getuid());
  console.log("FIXTURE_ANCESTOR",JSON.stringify({depth:cursor.split("/").filter(Boolean).length,mode:(st.mode&0o7777).toString(8),uidMatch:st.uid===process.getuid(),rootOwned:st.uid===0,safe}));
  const next=dirname(cursor);if(next===cursor)break;cursor=next;
 }
 console.log("FIXTURE_ENV",JSON.stringify({tmpMatches:tmpdir()===process.env.TMPDIR,runnerHomeMatches:root===process.env.HOME}));
}
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
const progress=createTestProgress({label:'isolated',total:files.length});
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
   if(output.exit!==0){
    failed++;
    progress.clearLine();
    console.error("FAIL",file,"\n",output.text.slice(-3000));
   }
   progress.update({done:completed,errors:failed});
  }
 });
 await Promise.all(jobs);
 if(failed)process.exitCode=1;
}finally{
 progress.finish({done:completed,errors:failed});
 console.log("Isolated test files:",files.length,"passed assertions:",passed,"failed files:",failed);
 rmSync(root,{recursive:true,force:true});
}
