// Bounded Russian natural questions. Never authorize any physical action.
const clean=text=>typeof text==='string'?text.toLowerCase().replace(/ё/g,'е').trim().replace(/[?.!]+$/g,'').replace(/\s+/g,' '):'';
const phrases=Object.freeze({
 sauna:new Set(['какая температура в сауне','сколько градусов в сауне','температура сауны','сауна готова','готова ли сауна','что с сауной','сколько сейчас градусов в сауне']),
 lights:new Set(['какой свет включен','какие лампы включены','состояние освещения','где горит свет','какой свет сейчас включен','что со светом','покажи включенный свет','какой свет выключен','какие светильники выключены','где выключен свет','какие лампы сейчас выключены','покажи выключенный свет','весь ли свет выключен']),
 kitchen_review:new Set(['какой свет на кухне','что со светом на кухне','горит ли свет на кухне','какие лампы включены на кухне','состояние света на кухне']),
 tambour:new Set(['свет в тамбуре включен','состояние света в тамбуре','какое состояние света в тамбуре','горит ли свет в тамбуре','что со светом в тамбуре'])
});
export function classifyReadonlyQuestion(input){
 const text=clean(input);
 for(const [category,values] of Object.entries(phrases))if(values.has(text))return category;
 // Never pass arbitrary questions about existing read-only subjects into a write dispatcher.
 if((typeof input==='string'&&input.includes('?')) || ['какой ','какая ','какие ','сколько ','где ','готова ли ','горит ли ','что с ','что со ','покажи ','состояние ','температура '].some(prefix=>text.startsWith(prefix)))
  return 'unsupported_question';
 return null;
}
