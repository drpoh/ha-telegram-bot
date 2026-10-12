// One-time operator-reported HA-MCP diagnostic snapshot, 2026-10-12.
// Evidence only: NOT a runtime cache, write policy or proof of physical identity.
// Excludes Browser Mod and every non-light entity.
import {NEW_LIGHT_IDS} from './new-light-candidates.mjs';
const on=new Set(['light.vykliuchatel_z_gostinaia_l3']);
const off=new Set([
 'light.kukhnia_led_niz_l1','light.kukhnia_svet','light.led_kukhnia',
 'light.vykliuchatel_z_gostinaia_l1','light.vykliuchatel_z_gostinaia_l2',
 'light.sauna_led1','light.wled_gledopto','light.tambur_svet_l2'
]);
export const NEW_LIGHT_OBSERVED_SNAPSHOT=Object.freeze(NEW_LIGHT_IDS.map(id=>Object.freeze({
 id,state:on.has(id)?'on':off.has(id)?'off':'unknown',evidence:'owner_manual_readonly_2026_10_12'
})));
export function summarizeNewLightObservation(snapshot=NEW_LIGHT_OBSERVED_SNAPSHOT){
 if(!Array.isArray(snapshot)||snapshot.length!==NEW_LIGHT_IDS.length||
    snapshot.some((s,i)=>s?.id!==NEW_LIGHT_IDS[i]||!['on','off','unknown'].includes(s.state)))
  return {status:'invalid',authorization:false,actualWrite:false};
 const counts={on:0,off:0,unknown:0};
 for(const item of snapshot)counts[item.state]++;
 return {status:counts.unknown?'partial':'complete',counts,authorization:false,actualWrite:false};
}
