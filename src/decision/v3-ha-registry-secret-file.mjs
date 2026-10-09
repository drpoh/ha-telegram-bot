import {open,lstat} from 'node:fs/promises';
import {constants} from 'node:fs';

// Optional trusted local secret reader. No production wiring, no HA requests.
// Reject links, non-files, foreign owner, group/other access and oversized data.
export async function readProtectedRegistrySecret({path,ownerUid=process.getuid?.(),maxBytes=4096}={}){
 if(typeof path!=='string'||!path.startsWith('/')||path.includes('\0')||
    !Number.isSafeInteger(ownerUid)||ownerUid<0||!Number.isSafeInteger(maxBytes)||maxBytes<16||maxBytes>4096)
  throw Error('invalid_secret_configuration');
 const initial=await lstat(path);
 if(!initial.isFile()||initial.isSymbolicLink()||initial.uid!==ownerUid||(initial.mode&0o077)!==0||initial.size>maxBytes||initial.size<16)
  throw Error('untrusted_secret_file');
 const fd=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
 try{
  const st=await fd.stat();
  if(!st.isFile()||st.uid!==ownerUid||(st.mode&0o077)!==0||st.size>maxBytes||st.size<16||
    st.ino!==initial.ino||st.dev!==initial.dev)throw Error('secret_file_changed');
  const data=await fd.readFile({encoding:'utf8'});
  if(Buffer.byteLength(data,'utf8')>maxBytes||data.length<16||data.length>4096||/\s/.test(data))throw Error('invalid_secret_contents');
  return data;
 }finally{await fd.close();}
}
