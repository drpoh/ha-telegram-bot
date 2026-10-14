// Bounded read-only room inventory from existing owner-reviewed HA candidate IDs.
// This is NOT a complete physical room inventory nor permission to switch anything.
import {NEW_LIGHT_CANDIDATES} from './new-light-candidates.mjs';
import {inspectNewLights} from './new-light-review.mjs';

const buckets=Object.freeze({
 living:Object.freeze({name:'Гостиная',areas:['Гостиная']}),
 bedroom:Object.freeze({name:'Спальня',areas:['Спальня']}),
 bathroom:Object.freeze({name:'Ванная и сауна',areas:['Ванная и Сауна']}),
 kitchen_extra:Object.freeze({name:'Кухня — дополнительные кандидаты',areas:['Кухня']}),
 hallway_extra:Object.freeze({name:'Коридор — дополнительные кандидаты',areas:['Коридор','коридор 1 этаж']})
});
export const ROOM_READONLY_GROUPS=Object.freeze(Object.fromEntries(
 Object.entries(buckets).map(([key,info])=>[key,Object.freeze({
  name:info.name,
  targets:Object.freeze(NEW_LIGHT_CANDIDATES.filter(item=>info.areas.includes(item.area)))
 })])
));
const error=()=>({status:'unavailable',authorization:false,actualWrite:false,
 text:'Не удалось проверить выбранные светильники. Никаких команд не отправлено.'});
export async function summarizeCandidateRoom({room,readState}={}){
 const group=Object.hasOwn(ROOM_READONLY_GROUPS,room)?ROOM_READONLY_GROUPS[room]:null;
 if(!group||typeof readState!=='function'||!group.targets.length||group.targets.length>7)
  return error();
 const report=await inspectNewLights({readState,candidates:group.targets});
 if(report?.authorization!==false||report?.actualWrite!==false||
    report.entries?.length!==group.targets.length||
    report.entries.some((entry,i)=>entry.id!==group.targets[i].id||
      !['on','off','unknown'].includes(entry.state)))
  return error();
 const {on,off,unknown}=report.counts;
 const yes=report.entries.filter(item=>item.state==='on').map(item=>item.id);
 const missed=report.entries.filter(item=>item.state==='unknown').map(item=>item.id);
 const total=group.targets.length;
 let text=group.name+': среди '+total+' выбранных HA-кандидатов включено '+on+
  ', выключено '+off+', неизвестно/недоступно '+unknown+'.';
 if(yes.length)text+=' ON: '+yes.join(', ')+'.';
 if(missed.length)text+=' Не проверены: '+missed.join(', ')+'.';
 text+=' Список не равен числу физических ламп; названия и привязка к комнате не проверены. Управление запрещено.';
 return {status:unknown?'partial':'complete',authorization:false,actualWrite:false,
  counts:{on,off,unknown},text};
}
