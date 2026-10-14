// Scope is the three corridor entries already present in LIGHT_OVERVIEW_TARGETS.
// This is a subset of selected HA entities, not a physical-room inventory or write allowlist.
import {LIGHT_OVERVIEW_TARGETS} from './light-overview.mjs';

const ids=Object.freeze(['light.koridor','light.koridor_1_etazh','light.koridor_spot']);
const selected=Object.freeze(ids.map(id=>LIGHT_OVERVIEW_TARGETS.find(item=>item.id===id)));
const denied=Object.freeze({
 status:'unavailable',authorization:false,actualWrite:false,
 text:'Не удалось проверить выбранный свет в коридоре. Состояние неизвестно. Никаких команд не отправлено.'
});

export async function summarizeCorridorLights({readState}={}){
 if(typeof readState!=='function'||selected.some(item=>!item))return {...denied};
 const on=[],off=[],unknown=[];
 for(const item of selected){
  try{
   const raw=await readState(item.id);
   const value=(raw?.structuredContent??raw)?.data??(raw?.structuredContent??raw);
   if(raw?.isError===true||value?.entity_id!==item.id ||
      !['on','off'].includes(value?.state)){unknown.push(item.id);continue;}
   if(value.state==='on')on.push(item.label);
   else off.push(item.label);
  }catch{unknown.push(item.id);}
 }
 let text='Коридор — 3 выбранные сущности Home Assistant: включено '+on.length+
  ', выключено '+off.length+', недоступно или неизвестно '+unknown.length+'.';
 if(on.length)text+=' В состоянии ON: '+on.join(', ')+'.';
 if(unknown.length)text+=' Не удалось проверить: '+unknown.join(', ')+'.';
 text+=' Это не весь физический свет коридора и не разрешение на управление.';
 return {status:unknown.length?'partial':'complete',authorization:false,actualWrite:false,
  counts:{on:on.length,off:off.length,unknown:unknown.length},text};
}
