import {autonomyPolicy} from "../policy/config.mjs";

// The running v2 policy is not automatically a v3 CONFIRM grant.
// V3 fixture requires operator-reviewed explicit CONFIRM entries in a
// separate, trusted config. This default deliberately authorizes no writes.
const empty=Object.freeze({default:"deny",entities:Object.freeze({})});
export function getV3ReviewedPolicy(){
 return structuredClone(empty);
}
export function getLegacyPolicyInventory(){
 return Object.freeze({count:Object.keys(autonomyPolicy.entities).length,
  status:"review_required_not_imported"});
}
