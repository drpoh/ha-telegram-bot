// Pure matching of an explicitly named room in Russian user text.
// Never infer an area from a model-proposed name alone.
const CASES = {
 'гостиная':['гостиная','гостиной','гостиную'],
 'кухня':['кухня','кухне','кухню','кухни'],
 'ванная':['ванная','ванной','ванную'],
 'сауна':['сауна','сауне','сауну','сауны'],
 'коридор':['коридор','коридоре','коридора'],
 'тамбур':['тамбур','тамбуре','тамбура'],
 'спальня':['спальня','спальне','спальню','спальни'],
};
function normalize(value) {
 return String(value||'').toLocaleLowerCase('ru-RU').replace(/ё/g,'е')
  .replace(/[^\p{L}\p{N}_]+/gu,' ').replace(/\s+/g,' ').trim();
}
export function explicitSceneAreaMention(userText, areaName) {
 const input=normalize(userText);
 const area=normalize(areaName);
 if(!input||!area) return false;
 const words=new Set(input.split(' '));
 const mentioned=Object.entries(CASES).filter(([,forms])=>forms.some(form=>words.has(form))).map(([key])=>key);
 // Multiple distinct room names require clarification. 'Ванная и Сауна'
 // remains a single HA room only when the full area label is explicit.
 if(mentioned.length>1 && !(' '+input+' ').includes(' '+area+' ')) return false;
 // Full canonical area names can be given verbatim.
 if((' '+input+' ').includes(' '+area+' ')) return true;
 // A compound HA room such as "Ванная и Сауна" can be named by
 // either unique room noun, but only the caller can establish uniqueness.
 const components=area.split(' ').filter(w=>w!=='и');
 return components.some(w=>(CASES[w]||[w]).some(form=>words.has(form)));
}
