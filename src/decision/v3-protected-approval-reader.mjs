import {lstat,open} from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname,isAbsolute,basename} from 'node:path';

// Offline read-only source guard. Cannot establish owner identity or authorize writes.
export async function readProtectedApprovalCandidate({path}={}){
 const deny=reason=>({ok:false,reason});
 if(typeof path!=='string'||!isAbsolute(path)||!/^approval-[a-z0-9_-]{1,40}\.json$/.test(basename(path)))return deny('invalid_path');
 let handle;
 try{
  const dir=await lstat(dirname(path));
  if(!dir.isDirectory()||dir.isSymbolicLink()||dir.uid!==process.getuid()||(dir.mode&0o077)!==0)return deny('unsafe_directory');
  handle=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  const stat=await handle.stat();
  if(!stat.isFile()||stat.uid!==process.getuid()||(stat.mode&0o077)!==0||stat.size>4096)return deny('unsafe_record');
  const bytes=await handle.readFile();
  const after=await handle.stat();
  const current=await lstat(path);
  const dirAfter=await lstat(dirname(path));
  if(bytes.length>4096||after.dev!==stat.dev||after.ino!==stat.ino||after.mtimeMs!==stat.mtimeMs||after.size!==stat.size||
   current.dev!==stat.dev||current.ino!==stat.ino||current.isSymbolicLink()||
   dirAfter.dev!==dir.dev||dirAfter.ino!==dir.ino||(dirAfter.mode&0o077)!==0)return deny('source_changed');
  return {ok:true,record:JSON.parse(bytes.toString('utf8')),authorization:false};
 }catch{return deny('unreadable_record');}
 finally{if(handle)await handle.close();}
}
