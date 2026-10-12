// DEV-only composition for offline acceptance of nine-light confirmation and dispatch.
// Never import this module into production Telegram without separate deployment review.
import {createNineLightTelegramConsent} from './nine-light-telegram-consent.mjs';
import {createNewLightDispatch} from './new-light-physical-dispatch.mjs';
export function createNineLightTestHarness({callTool,verifyAdmission,approvedIds=[],releaseEnabled=false,executionJournal,clock}={}){
 const boundary=createNewLightDispatch({callTool,verifyAdmission,approvedIds,releaseEnabled});
 return createNineLightTelegramConsent({dispatch:payload=>boundary.dispatch(payload),executionJournal,clock});
}
