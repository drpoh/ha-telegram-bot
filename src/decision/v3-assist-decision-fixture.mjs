import {createIsolatedAssistAdapter} from "./v3-isolated-assist-adapter.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";

// Pure offline planning gate. Never invokes an HA tool or claims authorization.
export function createAssistDecisionFixture({knownSatellites=[],reviewedLowRiskEntities=[]}={}){
 const adapter=createIsolatedAssistAdapter({knownSatellites});
 const approved=new Set(reviewedLowRiskEntities);
 return Object.freeze({
  assess({satelliteId,transcript,action,risk="unknown",claimedArea}={}){
   const result=adapter.receive({satelliteId,transcript});
   if(!result.accepted)return {outcome:"deny",reason:"invalid_origin"};
   if(claimedArea!=null)return {outcome:"deny",reason:"untrusted_area"};
   if(!adapter.eligibleForReview(result.command,{risk}))
    return {outcome:"deny",reason:"insufficient_assurance"};
   if(!checkV3ToolBoundary(action).allowed)return {outcome:"deny",reason:"tool_boundary"};
   if(!approved.has(action?.args?.entity_id))
    return {outcome:"deny",reason:"not_reviewed"};
   return {outcome:"review",command:result.command,action:structuredClone(action),
    reason:"requires_authoritative_scope_and_policy"};
  },
 });
}
