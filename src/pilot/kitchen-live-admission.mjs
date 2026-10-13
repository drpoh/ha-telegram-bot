import {readV3PolicyFile} from '../decision/v3-operator-policy-loader.mjs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const TARGET='light.tambur_svet_l1';
const DEVICE='4cbaab0f1663e40a638b7636f938a7e7';
const UNIQUE='0xa4c13898b491c3ca_light_l1_zigbee2mqtt';
const POLICY_DIR='/home/drpoh/.config/rs-home-ai-v3';
export function createKitchenLiveAdmission({expectedSha256,registryReader}={}){
 const reader=registryReader??(async file=>{
  const {stdout}=await exec('ssh',['-o','BatchMode=yes','-o','ConnectTimeout=6','hassio@homeassistant.local','sudo','-n','cat','/config/.storage/'+file],{timeout:13000,maxBuffer:8000000});
  return JSON.parse(stdout);
 });
 return async action=>{
  if(action?.name!=='ha_call_service'||action.args?.domain!=='light'||action.args?.entity_id!==TARGET||
     !['turn_on','turn_off'].includes(action.args?.service)||Object.keys(action.args).sort().join(',')!=='domain,entity_id,service')return {valid:false};
  if(!expectedSha256)return {valid:false};
  const policy=await readV3PolicyFile({directory:POLICY_DIR,filename:'kitchen-operator-policy.json',expectedSha256});
  const grant=policy.policy?.entities?.[TARGET];
  if(!policy.ok || Object.keys(policy.policy.entities).length!==1 || grant?.level!=='confirm' ||
     grant.services?.length!==2 || !grant.services.includes('turn_on') || !grant.services.includes('turn_off'))return {valid:false};
  const [entities,devices]=await Promise.all([reader('core.entity_registry'),reader('core.device_registry')]);
  const matched=entities.data?.entities?.filter(e=>e.entity_id===TARGET);
  const e=matched?.length===1?matched[0]:null;
  const device=devices.data?.devices?.find(d=>d.id===DEVICE);
  return {valid:!!(e?.platform==='mqtt' && e?.unique_id===UNIQUE && e?.device_id===DEVICE &&
     !e.disabled_by && device?.area_id==='koridor_1_etazh' && !device.disabled_by)};
 };
}
