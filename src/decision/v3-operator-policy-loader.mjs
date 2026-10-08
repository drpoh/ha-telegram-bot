import {realpath,lstat,open} from "node:fs/promises";
import {constants} from "node:fs";
import {isAbsolute,resolve,relative,sep} from "node:path";
import {validateV3OperatorPolicy} from "./v3-operator-policy-schema.mjs";

// Offline only. Parsing a policy file never authorizes it for execution.
export async function readV3PolicyFile({directory,filename}={}){
 const deny=(reason)=>({ok:false,reason,policy:{default:"deny",entities:{}}});
 if(typeof directory!=="string" || !isAbsolute(directory) ||
    typeof filename!=="string" || !/^[a-z0-9][a-z0-9_.-]{0,80}\.json$/.test(filename))
  return deny("invalid_source");
 let handle;
 try{
  const rootStat=await lstat(directory);
  if(!rootStat.isDirectory() || rootStat.isSymbolicLink() ||
     (rootStat.mode&0o022)!==0 || rootStat.uid!==process.getuid())
   return deny("unsafe_directory");
  const root=await realpath(directory);
  const expected=resolve(root,filename);
  const rel=relative(root,expected);
  if(!rel || rel.startsWith(".."+sep) || rel===".." || isAbsolute(rel))
   return deny("outside_directory");
  // O_NOFOLLOW and fstat protect the opened file against final-component
  // symlink substitution, unlike lstat followed by readFile(path).
  handle=await open(expected,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  const stat=await handle.stat();
  if(!stat.isFile() || stat.size>65536 || (stat.mode&0o022)!==0 ||
     stat.uid!==process.getuid())return deny("unsafe_file");
  const bytes=await handle.readFile();
  if(bytes.length>65536)return deny("oversized_file");
  // Detect common replacement/rewrite races; this is not full directory
  // descriptor provenance and must not authorize production grants.
  const after=await handle.stat();
  const directoryAfter=await lstat(directory);
  if(after.dev!==stat.dev || after.ino!==stat.ino || after.size!==stat.size ||
     after.mtimeMs!==stat.mtimeMs || !directoryAfter.isDirectory() ||
     directoryAfter.dev!==rootStat.dev || directoryAfter.ino!==rootStat.ino ||
     (directoryAfter.mode&0o022)!==0)
   return deny("source_changed");
  const checked=validateV3OperatorPolicy(JSON.parse(bytes.toString("utf8")));
  if(!checked.valid)return deny(checked.reason);
  return {ok:true,policy:checked.policy,status:"parsed_not_operator_approved"};
 }catch{return deny("unreadable_or_invalid");}
 finally{if(handle)await handle.close();}
}
