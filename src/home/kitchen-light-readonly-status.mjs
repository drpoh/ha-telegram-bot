// DEV-only answer for a small, fixed operator-reviewed HA entity sample in the kitchen.
// This is NOT an HA area registry, count of physical lights, or permission to actuate.
import {NEW_LIGHT_CANDIDATES} from './new-light-candidates.mjs';
import {inspectNewLights} from './new-light-review.mjs';

export const REVIEWED_KITCHEN_LIGHTS=Object.freeze(
 NEW_LIGHT_CANDIDATES.filter(candidate=>candidate.area==='Кухня')
);
const denied=Object.freeze({
 status:'unavailable',authorization:false,actualWrite:false,
 text:'Не удалось проверить выбранные сущности света на кухне. Состояние неизвестно. Никаких переключений не выполнялось.'
});
export async function summarizeReviewedKitchenLights({readState}={}){
 if(typeof readState!=='function'||REVIEWED_KITCHEN_LIGHTS.length!==7)return {...denied};
 const report=await inspectNewLights({readState,candidates:REVIEWED_KITCHEN_LIGHTS});
 if(report.authorization!==false||report.actualWrite!==false||
    report.entries?.length!==REVIEWED_KITCHEN_LIGHTS.length||
    report.entries.some((entry,i)=>entry.id!==REVIEWED_KITCHEN_LIGHTS[i].id||
      entry.area!=='Кухня'||!['on','off','unknown'].includes(entry.state)))
   return {...denied};
 const {on,off,unknown}=report.counts;
 const selected=report.entries.filter(e=>e.state==='on').map(e=>e.id);
 const missing=report.entries.filter(e=>e.state==='unknown').map(e=>e.id);
 let text='Кухня — из 7 выбранных сущностей Home Assistant: включено '+on+
  ', выключено '+off+', неизвестно или недоступно '+unknown+'.';
 if(selected.length)text+=' В состоянии ON: '+selected.join(', ')+'.';
 if(missing.length)text+=' Не удалось проверить: '+missing.join(', ')+'.';
 text+=' Это НЕ весь свет кухни и НЕ число физических ламп. Идентичность устройств пока не подтверждена; управление новыми светильниками заблокировано.';
 return {status:unknown?'partial':'complete',authorization:false,actualWrite:false,
  counts:{on,off,unknown},text};
}
