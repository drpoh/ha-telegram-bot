// DEV-only presentation of bounded fresh results from the existing reviewed
// new-light inspector. Never read the historical observed snapshot as live truth.
import {NEW_LIGHT_CANDIDATES,NEW_LIGHT_IDS} from './new-light-candidates.mjs';

export function summarizeNewLightsByArea(result){
 const fail={status:'invalid',authorization:false,actualWrite:false,areas:[]};
 if(result?.authorization!==false||result?.actualWrite!==false||
    !Array.isArray(result?.entries)||result.entries.length!==NEW_LIGHT_IDS.length)return fail;
 const areas=new Map();
 for(let i=0;i<NEW_LIGHT_IDS.length;i++){
  const entry=result.entries[i],candidate=NEW_LIGHT_CANDIDATES[i];
  if(entry?.id!==candidate.id||entry?.area!==candidate.area||
     !['on','off','unknown'].includes(entry?.state))return fail;
  const group=areas.get(candidate.area)??{area:candidate.area,on:0,off:0,unknown:0};
  group[entry.state]++;
  areas.set(candidate.area,group);
 }
 const groups=[...areas.values()].map(x=>Object.freeze({...x}));
 return {status:groups.some(x=>x.unknown)?'partial':'complete',
  authorization:false,actualWrite:false,areas:groups,
  text:groups.map(x=>x.area+': включено '+x.on+', выключено '+x.off+', недоступно или неизвестно '+x.unknown).join('. ')+
   '. Только 19 выбранных сущностей HA; не весь свет дома и не число физических ламп.'};
}
