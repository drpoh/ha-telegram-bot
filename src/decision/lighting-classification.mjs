// A reviewed local classification is data, never AI-generated authorization.
// This module does not execute any Home Assistant service.
import fs from 'node:fs/promises';
export async function loadLightingClassification({path}={}) {
 if (typeof path !== 'string' || !path.trim()) return {ok:false,status:'missing_configuration'};
 try {
  const doc=JSON.parse(await fs.readFile(path,'utf8'));
  if (doc?.version !== 1 || !Array.isArray(doc.areas)) return {ok:false,status:'invalid_configuration'};
  const areas=new Map();
  for(const a of doc.areas) {
   if(!a || typeof a.area_id!=='string' || !a.area_id.trim() ||
       typeof a.area_name!=='string' || !a.area_name.trim() ||
       !Array.isArray(a.light_ids) || !Array.isArray(a.excluded_light_ids) || !Array.isArray(a.switch_light_ids)) return {ok:false,status:'invalid_configuration'};
   const all=[...a.light_ids,...a.excluded_light_ids,...a.switch_light_ids];
   if(areas.has(a.area_id) || new Set(all).size!==all.length ||
      !a.light_ids.every(x=>typeof x==='string' && x.startsWith('light.')) ||
      !a.excluded_light_ids.every(x=>typeof x==='string' && x.startsWith('light.')) ||
      !a.switch_light_ids.every(x=>typeof x==='string' && x.startsWith('switch.'))) return {ok:false,status:'invalid_configuration'};
   areas.set(a.area_id,Object.freeze({areaId:a.area_id,areaName:a.area_name,
    lightIds:Object.freeze([...a.light_ids]),excludedLightIds:Object.freeze([...a.excluded_light_ids]),
    switchLightIds:Object.freeze([...a.switch_light_ids])}));
  }
  return {ok:true,status:'loaded',areas};
 } catch { return {ok:false,status:'configuration_unavailable'}; }
}
export function resolveReviewedClassification(result, areaId, areaName) {
 if(result?.ok!==true || typeof areaId!=='string' || typeof areaName!=='string')
  return {ok:false,status:'configuration_unavailable'};
 const area=result.areas?.get(areaId);
 if(!area || area.areaName!==areaName) return {ok:false,status:'area_not_configured'};
 return {ok:true,status:'reviewed',classification:area};
}
