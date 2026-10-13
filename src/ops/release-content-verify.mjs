// Read-only release integrity: compare tracked Git blob contents, not tar uid/gid/mtime.
// Executable Git mode is checked separately. Never reads untracked secrets/node_modules.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {constants,closeSync,fstatSync,lstatSync,openSync,readFileSync,readSync,readlinkSync,realpathSync} from 'node:fs';
import {basename,dirname,isAbsolute,join,relative,resolve,sep} from 'node:path';

const shaPattern=/^[0-9a-f]{40}$/;
const cleanResult=(reason)=>({
 status:'unverified',reason,commit:null,tracked:0,checked:0,
 missing:0,modified:0,typeMismatch:0,execModeMismatch:0,unsupported:0,issues:[]
});

function blobHashFromBuffer(buffer){
 return createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
}

function blobHashFromFile(path,size){
 const hash=createHash('sha1').update('blob '+size+'\0');
 const buf=Buffer.allocUnsafe(65536);
 const fd=openSync(path,constants.O_RDONLY | (constants.O_NOFOLLOW??0));
 try{
  const stat=fstatSync(fd);
  if(!stat.isFile()||stat.size!==size)throw Error('file_changed_during_read');
  let got;
  while((got=readSync(fd,buf,0,buf.length,null))>0)hash.update(buf.subarray(0,got));
  return hash.digest('hex');
 }finally{closeSync(fd);}
}

// Trust root input only for a deliberately selected operator/release path.
export function verifyTrackedReleaseContent({repoDir,releaseDir,expectedPrefix='9dd5964'}={}){
 const result=cleanResult('preflight_failed');
 if(typeof repoDir!=='string'||typeof releaseDir!=='string'||
    !/^[a-f0-9]{7,40}$/.test(expectedPrefix))return result;
 try{
  const repoRoot=realpathSync(repoDir);
  const releaseRoot=realpathSync(releaseDir);
  if(!lstatSync(repoDir).isDirectory()||!lstatSync(releaseDir).isDirectory()||
     repoRoot!==resolve(repoDir)||releaseRoot!==resolve(releaseDir))return cleanResult('invalid_root');
  const releaseName=basename(releaseRoot);
  if(!releaseName.startsWith('rs-home-ai-v3-release-'+expectedPrefix))return cleanResult('release_name_mismatch');
  const marker=join(releaseRoot,'RELEASE_COMMIT');
  if(!lstatSync(marker).isFile())return cleanResult('release_marker_invalid');
  const commit=readFileSync(marker,'utf8').trim();
  if(!shaPattern.test(commit)||!commit.startsWith(expectedPrefix))return cleanResult('release_marker_mismatch');
  result.commit=commit;
  const manifest=execFileSync('git',['-C',repoRoot,'ls-tree','-r','-z','--full-tree',commit],{
   encoding:null,timeout:12000,maxBuffer:25*1024*1024,stdio:['ignore','pipe','pipe']
  });
  const entries=manifest.subarray(0).toString('utf8').split('\0').filter(Boolean);
  if(entries.length===0)return {...result,reason:'empty_git_tree'};
  result.tracked=entries.length;
  for(const record of entries){
   const tab=record.indexOf('\t');
   if(tab<0){result.unsupported++;continue;}
   const descriptor=record.slice(0,tab).split(' ');
   if(descriptor.length!==3){result.unsupported++;continue;}
   const [gitMode,gitType,gitBlob]=descriptor;
   const rel=record.slice(tab+1);
   const abs=resolve(releaseRoot,rel);
   const pathRel=relative(releaseRoot,abs);
   const safe=rel.length>0&&!isAbsolute(rel)&&!pathRel.startsWith('..'+sep)&&
      pathRel!=='..'&&!isAbsolute(pathRel)&&!rel.split('/').includes('..');
   if(!safe||gitType!=='blob'||!['100644','100755','120000'].includes(gitMode)||
      !shaPattern.test(gitBlob)){
    result.unsupported++;
    if(result.issues.length<10)result.issues.push({path:rel,reason:'unsupported_or_unsafe'});
    continue;
   }
   try{
    // Never dereference a symlinked parent directory outside this pinned release.
    const parent=realpathSync(dirname(abs));
    const within=parent===releaseRoot||parent.startsWith(releaseRoot+sep);
    if(!within){result.typeMismatch++;throw Error('outside_release_root');}
    const stat=lstatSync(abs);
    if(gitMode==='120000'){
     if(!stat.isSymbolicLink()){result.typeMismatch++;throw Error('not_a_symlink');}
     const data=Buffer.from(readlinkSync(abs));
     if(blobHashFromBuffer(data)!==gitBlob){result.modified++;throw Error('content_differs');}
    }else{
     if(!stat.isFile()){result.typeMismatch++;throw Error('not_a_file');}
     if(blobHashFromFile(abs,stat.size)!==gitBlob){result.modified++;throw Error('content_differs');}
     if((gitMode==='100755')!==Boolean(stat.mode&0o111))result.execModeMismatch++;
    }
    result.checked++;
   }catch(err){
    if(err?.code==='ENOENT'){result.missing++;if(result.issues.length<10)result.issues.push({path:rel,reason:'missing'});}
    else if(result.issues.length<10)result.issues.push({path:rel,reason:err?.message==='content_differs'?'content_differs':'type_or_read_error'});
    if(err?.message==='outside_release_root'||err?.message==='not_a_file'||err?.message==='not_a_symlink')continue;
    if(err?.message!=='content_differs'&&err?.code!=='ENOENT')result.unsupported++;
   }
  }
  const contentOk=result.missing===0&&result.modified===0&&result.typeMismatch===0&&
     result.unsupported===0&&result.checked===result.tracked;
  const allOk=contentOk&&result.execModeMismatch===0;
  return {...result,status:allOk?'pass':'unverified',reason:!contentOk?'tracked_content_or_type_mismatch':result.execModeMismatch?'executable_mode_mismatch':'match',contentMatch:contentOk,execModeMatch:result.execModeMismatch===0};
 }catch{
  return {...result,status:'unverified',reason:'read_failed'};
 }
}
