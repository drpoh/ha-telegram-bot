// Candidate light inventory copied from owner-provided 2026-10-12 HA Template export.
// This is read-only REVIEW DATA, not verified physical fixtures or an HA authorization list.
// Explicitly exclude every light.browser_mod*, ESPHome status LEDs, whole-home groups,
// lights marked unused and potentially overlapping alias entries until identity review.
export const NEW_LIGHT_CANDIDATES=Object.freeze([
 ['light.kukhnia_led_niz_l1','Кухня','Лед низ'],
 ['light.kukhnia_led_niz_l1_2','Кухня','Кухня Led низ L1'],
 ['light.kukhnia_led_niz_l2_2','Кухня','Кухня Led низ L2'],
 ['light.kukhnia_svet','Кухня','Кухня свет'],
 ['light.kukhnia_svet_3','Кухня','Свет'],
 ['light.led_kukhnia','Кухня','Лед'],
 ['light.podsvetka_kukhnia','Кухня','Подсветка кухня'],
 ['light.liustra','Гостиная','Люстра'],
 ['light.podsvetka','Гостиная','Подсветка'],
 ['light.podsvetka_2','Гостиная','Спот'],
 ['light.vykliuchatel_z_gostinaia_l1','Гостиная','Выключатель z Гостиная L1'],
 ['light.vykliuchatel_z_gostinaia_l2','Гостиная','Люстра'],
 ['light.vykliuchatel_z_gostinaia_l3','Гостиная','Выключатель z Гостиная L3'],
 ['light.spalnia','Спальня','Спальня'],
 ['light.sonoff_1000d78a79','Коридор','Коридор свет'],
 ['light.sauna_led1','Ванная и Сауна','Sauna_Led1'],
 ['light.wled_gledopto','Ванная и Сауна','Подсветка'],
 ['light.tambur_svet_l2','коридор 1 этаж','Тамбур свет L2'],
 ['light.tambur_svet_l2_2','коридор 1 этаж','Свет']
].map(([id,area,label])=>Object.freeze({id,area,label,review:'unverified',readOnly:true})));
export const NEW_LIGHT_IDS=Object.freeze(NEW_LIGHT_CANDIDATES.map(x=>x.id));
const existingIds=new Set(['light.tambur_svet_l1','light.koridor','light.koridor_1_etazh','light.koridor_spot']);
export function validateNewLightCandidates(candidates=NEW_LIGHT_CANDIDATES){
 if(!Array.isArray(candidates)||candidates.length===0||candidates.length>40)return false;
 const seen=new Set();
 for(const item of candidates){
  if(typeof item?.id!=='string'||!/^light\.[a-z0-9_]+$/.test(item.id)||
     item.id.startsWith('light.browser_mod')||existingIds.has(item.id)||
     seen.has(item.id)||typeof item.area!=='string'||!item.area.trim()||
     typeof item.label!=='string'||!item.label.trim()||item.readOnly!==true||
     item.review!=='unverified')return false;
  seen.add(item.id);
 }
 return true;
}
