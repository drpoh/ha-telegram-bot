// DEV read-only exact-ID check. A HA entity state is never proof of a physical fixture.
import {NEW_LIGHT_CANDIDATES} from './new-light-candidates.mjs';
import {inspectNewLights} from './new-light-review.mjs';

const blocked={
 status:'unsupported',authorization:false,actualWrite:false,
 text:'Укажите один точный ID из /newlights, например: /lightcheck light.kukhnia_svet. Устройства не переключаются.'
};
export async function inspectSingleNewLight({entityId,readState}={}){
 const candidate=NEW_LIGHT_CANDIDATES.find(item=>item.id===entityId);
 if(!candidate||typeof readState!=='function')return {...blocked};
 const result=await inspectNewLights({readState,candidates:[candidate]});
 if(result.authorization!==false||result.actualWrite!==false||result.entries?.length!==1||
    result.entries[0]?.id!==entityId)
  return {status:'unavailable',authorization:false,actualWrite:false,
   text:'Не удалось проверить состояние указанной сущности HA. Никаких команд не отправлено.'};
 const entry=result.entries[0];
 const label=entry.state==='on'?'включено (on)':entry.state==='off'?'выключено (off)':
  'состояние неизвестно ('+entry.reason+')';
 const warning=entry.state==='unknown'?' Неизвестное состояние нельзя считать выключенным.':'';
 return {status:entry.state==='unknown'?'partial':'complete',
  authorization:false,actualWrite:false,entityId:entry.id,state:entry.state,
  text:entry.id+': '+label+'.'+warning+
  ' Это только состояние сущности Home Assistant, а не подтверждение физического светильника. Управление новыми устройствами заблокировано.'};
}
