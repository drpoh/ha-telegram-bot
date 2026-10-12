// Presentation mode for explicitly supported read-only Russian sauna questions.
// This module does not resolve devices or authorize HA actions.
const clean=value=>typeof value==='string'?value.toLowerCase().replace(/ё/g,'е').trim().replace(/[?.!]+$/g,'').replace(/\s+/g,' '):'';
const temperature=new Set([
 'какая температура в сауне',
 'сколько градусов в сауне',
 'температура сауны',
 'сколько сейчас градусов в сауне'
]);
const ready=new Set(['сауна готова','готова ли сауна']);
export function classifySaunaQuestionMode(input){
 const text=clean(input);
 if(temperature.has(text))return 'temperature';
 if(ready.has(text))return 'ready';
 return 'status';
}
