// Conservative offline release checklist. Only operator-owned evidence may be
// passed to this evaluator; never accept LLM/Telegram payloads as evidence.
// Evaluation never starts processes, contacts HA or grants execution rights.
const REQUIRED=Object.freeze([
 'trusted_ingress',
 'authenticated_ha_source',
 'reviewed_single_entity_policy',
 'confirmed_action_binding',
 'durable_no_replay_storage',
 'post_action_verification',
 'independent_ha_operation',
 'rollback_approved',
 'controlled_live_acceptance',
]);
export function evaluateV3MvpRelease(evidence={}){
 const missing=REQUIRED.filter(key=>evidence?.[key]!==true);
 return Object.freeze({
  ready:missing.length===0,
  missing:Object.freeze(missing),
  scope:'single_approved_light',
  releaseType:'operator_review_only',
 });
}
export const V3_MVP_REQUIRED=REQUIRED;
