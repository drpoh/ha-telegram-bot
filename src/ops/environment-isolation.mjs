import {isAbsolute,normalize,relative,sep} from 'node:path';
// Offline deployment manifest validation. Pass only operator-owned, redacted
// descriptors; do not put actual tokens or passwords in manifests or logs.
const ENVS=['dev','stage','prod'];
const fields=['service','storage','port','telegramCredentialRef','haEndpointRef'];
export function validateEnvironmentIsolation(manifests){
 const deny=reason=>({valid:false,reason});
 if(!Array.isArray(manifests)||manifests.length!==3)return deny('missing_environment');
 const index=new Map();
 for(const m of manifests){
  if(!m||!ENVS.includes(m.environment)||index.has(m.environment))return deny('invalid_or_duplicate_environment');
  for(const f of fields){
   if(f==='port'){if(!Number.isInteger(m.port)||m.port<1024||m.port>65535)return deny('invalid_port');}
   else if(typeof m[f]!=='string'||!m[f].trim())return deny('missing_'+f);
  }
  if(!isAbsolute(m.storage)||normalize(m.storage)!==m.storage||m.storage==='/'||m.storage.includes('\\'))return deny('unsafe_storage_path');
  index.set(m.environment,m);
 }
 for(const field of fields){
  if(new Set(ENVS.map(env=>index.get(env)[field])).size!==3)return deny('shared_'+field);
 }
 const paths=ENVS.map(env=>index.get(env).storage);
 for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++){
  const r=relative(paths[i],paths[j]);
  const backwards=relative(paths[j],paths[i]);
  if(r===''||(!r.startsWith('..'+sep)&&r!=='..'&&!isAbsolute(r))||
     backwards===''||(!backwards.startsWith('..'+sep)&&backwards!=='..'&&!isAbsolute(backwards)))
    return deny('nested_storage');
 }
 if(index.get('dev').haAccess!=='fixture'||index.get('stage').haAccess!=='mock'||index.get('prod').haAccess!=='approved_live')return deny('ha_access_boundary');
 if(index.get('dev').writeEnabled!==false||index.get('stage').writeEnabled!==false)return deny('nonprod_writes');
 return {valid:true,status:'offline_manifest_validated_only'};
}
