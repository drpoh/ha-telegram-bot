// DEV source-only formatter. It consumes fresh, validated HA-MCP inspection results.
// Not connected to Telegram or production and grants no HA access or actuation.
import {summarizeNewLightsByArea} from './new-light-area-summary.mjs';

const aliases=new Map([
 ['кухня','Кухня'],['кухне','Кухня'],
 ['гостиная','Гостиная'],['гостиной','Гостиная'],
 ['спальня','Спальня'],['спальне','Спальня'],
 ['коридор','Коридор'],['коридоре','Коридор'],
 ['сауна','Ванная и Сауна'],['сауне','Ванная и Сауна'],
 ['ванная','Ванная и Сауна'],['ванной','Ванная и Сауна'],
 ['тамбур','коридор 1 этаж'],['тамбуре','коридор 1 этаж']
]);
export function summarizeNewLightAreaQuery({inspection,area}={}){
 const denied={status:'unsupported',authorization:false,actualWrite:false,text:'Эта комната не входит в проверяемый список нового освещения.'};
 const key=typeof area==='string'?area.trim().toLowerCase():'';
 const target=aliases.get(key);
 if(!target)return denied;
 const overview=summarizeNewLightsByArea(inspection);
 if(overview.status==='invalid')return {status:'unavailable',authorization:false,actualWrite:false,text:'Не удалось проверить освещение в комнате. Состояние неизвестно.'};
 const group=overview.areas.find(x=>x.area===target);
 if(!group)return denied;
 const text=target+': включено '+group.on+', выключено '+group.off+', недоступно или неизвестно '+group.unknown+
  '. Это только выбранные новые сущности HA, а не весь свет комнаты и не количество физических светильников.';
 return {status:group.unknown?'partial':'complete',authorization:false,actualWrite:false,area:target,text};
}
