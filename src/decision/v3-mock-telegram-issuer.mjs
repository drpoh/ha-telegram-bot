import {extractV3TelegramIntent} from "./v3-telegram-intent.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";

// Fixture-only adapter. Must be invoked exclusively by a trusted Telegram
// transport handler; arbitrary objects are NOT authenticated by this function.
// The action is merely a candidate, not consent to execute.
export function createV3MockTelegramIssuer({ledger,allowedUserId}={}){
 if(typeof ledger?.issue!=="function" || !Number.isSafeInteger(allowedUserId))
  throw Error("invalid_issuer_dependencies");
 return Object.freeze({
  propose(ctx,candidateAction){
   const envelope=extractV3TelegramIntent(ctx,{allowedUserId});
   if(!envelope.accepted)return {status:"denied",reason:envelope.reason};
   const boundary=checkV3ToolBoundary(candidateAction);
   if(!boundary.allowed || boundary.status!=="eligible_for_separate_authorization")
    return {status:"denied",reason:"candidate_not_allowed"};
   const {token,expiresAt}=ledger.issue({
    ...envelope.actor,userText:envelope.originalUserText,
    action:structuredClone(candidateAction),
   });
   return {status:"pending",token,expiresAt};
  },
 });
}
