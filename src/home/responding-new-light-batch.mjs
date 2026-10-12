// Owner-approved batch review of the nine currently responding new light entities.
// Snapshot is NOT runtime authority: status can change; physical identity remains pending.
// No `light.browser_mod*`, no sensors, no automatic physical actions.
import {selectManualLights} from './manual-light-selection.mjs';
export const RESPONDING_NEW_LIGHT_IDS=Object.freeze([
 'light.kukhnia_led_niz_l1',
 'light.kukhnia_svet',
 'light.led_kukhnia',
 'light.vykliuchatel_z_gostinaia_l1',
 'light.vykliuchatel_z_gostinaia_l2',
 'light.vykliuchatel_z_gostinaia_l3',
 'light.sauna_led1',
 'light.wled_gledopto',
 'light.tambur_svet_l2'
]);
export const UNAVAILABLE_NEW_LIGHT_IDS=Object.freeze([
 'light.kukhnia_led_niz_l1_2','light.kukhnia_led_niz_l2_2',
 'light.kukhnia_svet_3','light.podsvetka_kukhnia',
 'light.liustra','light.podsvetka','light.podsvetka_2',
 'light.spalnia','light.sonoff_1000d78a79','light.tambur_svet_l2_2'
]);
export function reviewedVisibleLights(){
 const selected=selectManualLights([...RESPONDING_NEW_LIGHT_IDS]);
 if(selected.status!=='selected_for_review'||selected.targets.length!==9)throw Error('invalid_visible_light_set');
 return {status:'ready_for_identity_review',authorization:false,actualWrite:false,
  targets:selected.targets,excludedUnavailable:UNAVAILABLE_NEW_LIGHT_IDS.length};
}
