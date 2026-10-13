// DEV-only fixed read scope updated from owner HA Template, 2026-10-13.
// Four currently present kitchen control entities, NOT a complete physical room inventory.
// The historical 19-candidate source is unchanged: it is evidence, not a live allowlist.
import {inspectNewLights} from './new-light-review.mjs';

export const REVIEWED_KITCHEN_LIGHTS=Object.freeze([
 ['light.kukhnia_led_niz_l1','Кухня LED низ L1'],
 ['light.kukhnia_led_niz_l2','Кухня LED низ L2'],
 ['light.kukhnia_svet','Кухня свет (Switch as X)'],
 ['light.led_kukhnia','Кухня LED IKEA драйвер']
].map(([id,label])=>Object.freeze({id,area:'Кухня',label,review:'unverified',readOnly:true})));
const denied=Object.freeze({
 status:'unavailable',authorization:false,actualWrite:false,
 text:'Не удалось проверить выбранные сущности света на кухне. Состояние неизвестно. Никаких переключений не выполнялось.'
});
export async function summarizeReviewedKitchenLights({readState}={}){
 if(typeof readState!=='function'||REVIEWED_KITCHEN_LIGHTS.length!==4)return {...denied};
 const report=await inspectNewLights({readState,candidates:REVIEWED_KITCHEN_LIGHTS});
 if(report.authorization!==false||report.actualWrite!==false||
    report.entries?.length!==REVIEWED_KITCHEN_LIGHTS.length||
    report.entries.some((entry,i)=>entry.id!==REVIEWED_KITCHEN_LIGHTS[i].id||
      entry.area!=='Кухня'||!['on','off','unknown'].includes(entry.state)))
   return {...denied};
 const {on,off,unknown}=report.counts;
 const selected=report.entries.filter(e=>e.state==='on').map(e=>e.id);
 // Never expose raw MCP responses/errors. The inspector supplies only fixed reason codes.
 const reasons=Object.freeze({
  unavailable:'недоступна в HA',
  unknown:'состояние HA неизвестно',
  identity_mismatch:'ID ответа не совпал',
  mcp_error:'ошибка MCP',
  read_error:'ошибка чтения',
  invalid_state:'неверное состояние в ответе'
 });
 const missing=report.entries.filter(e=>e.state==='unknown').map(e=>({
  id:e.id,reason:e.reason
 }));
 if(missing.some(e=>!Object.hasOwn(reasons,e.reason)))return {...denied};
 let text='Кухня — из 4 выбранных сущностей Home Assistant: включено '+on+
  ', выключено '+off+', неизвестно или недоступно '+unknown+'.';
 if(selected.length)text+=' В состоянии ON: '+selected.join(', ')+'.';
 if(missing.length)text+=' Не удалось проверить: '+missing.map(e=>e.id+' ('+reasons[e.reason]+')').join(', ')+'.';
 text+=' Это НЕ весь свет кухни и НЕ число физических ламп. Идентичность устройств пока не подтверждена; управление новыми светильниками заблокировано.';
 return {status:unknown?'partial':'complete',authorization:false,actualWrite:false,
  counts:{on,off,unknown},unknownReasons:missing,text};
}
