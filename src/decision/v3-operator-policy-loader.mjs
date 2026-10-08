import {readFile,realpath,lstat} from "node:fs/promises";
import {isAbsolute,resolve,relative,sep} from "node:path";
import {validateV3OperatorPolicy} from "./v3-operator-policy-schema.mjs";

// Offline only: the trusted caller chooses the directory and filename.
export async function readV3PolicyFile({directory,filename}={}){
 const deny=(reason)=>({ok:false,reason,policy:{default:"deny",entities:{}}});
 if(typeof directory!=="string" || !isAbsolute(directory) ||
    typeof filename!=="string" || !/^[a-z0-9][a-z0-9_.-]{0,80}\.json$/.test(filename))
  return deny("invalid_source");
 try{
  const root=await realpath(directory);
  const expected=resolve(root,filename);
  const actual=await realpath(expected);
  const rel=relative(root,actual);
  if(!rel || rel.startsWith(".."+sep) || rel===".." || isAbsolute(rel))
   return deny("outside_directory");
  const stat=await lstat(expected);
  if(!stat.isFile() || stat.isSymbolicLink() || stat.size>65536 ||
     (stat.mode&0o022)!==0)return deny("unsafe_file");
  const checked=validateV3OperatorPolicy(JSON.parse(await readFile(expected,"utf8")));
  if(!checked.valid)return deny(checked.reason);
  return {ok:true,policy:checked.policy,status:"parsed_not_operator_approved"};
 }catch{return deny("unreadable_or_invalid");}
}
