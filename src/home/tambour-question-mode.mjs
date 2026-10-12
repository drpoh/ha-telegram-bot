// Presentation only. This function does not select an entity or authorize an action.
const normalize=input=>typeof input==='string'?input.toLowerCase().replace(/ё/g,'е').trim().replace(/[?.!]+$/g,'').replace(/\s+/g,' '):'';
const yesNo=new Set(['свет в тамбуре включен','горит ли свет в тамбуре']);
export function classifyTambourQuestionMode(input){
 return yesNo.has(normalize(input))?'yes_no':'status';
}
