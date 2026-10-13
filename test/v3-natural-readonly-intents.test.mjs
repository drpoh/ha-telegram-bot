import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyReadonlyQuestion} from '../src/home/readonly-question-intent.mjs';

test('exact Russian read-only queries allow only scoped subjects',()=>{
 for(const input of ['Какая температура в сауне?', 'Сколько градусов в сауне?', 'Сауна готова?','что с сауной'])
  assert.equal(classifyReadonlyQuestion(input),'sauna');
 for(const input of ['Какой свет включён?', 'Где горит свет?', 'Покажи включенный свет'])
  assert.equal(classifyReadonlyQuestion(input),'lights');
 for(const input of ['Горит ли свет в тамбуре?', 'Что со светом в тамбуре?'])
  assert.equal(classifyReadonlyQuestion(input),'tambour');
});
test('questions outside reviewed scope never become write proposals',()=>{
 for(const input of ['Сколько осталось до нагрева сауны?', 'Температура на улице?', 'Где мой телефон?'])
  assert.equal(classifyReadonlyQuestion(input),'unsupported_question');
 for(const input of ['Включи свет в тамбуре','Выключи свет в тамбуре'])
  assert.equal(classifyReadonlyQuestion(input),null);
});

test('bounded kitchen questions route to read-only kitchen inventory, never to action',()=>{
 for(const input of ['Какой свет на кухне?', 'Что со светом на кухне?', 'Горит ли свет на кухне?', 'Какие лампы включены на кухне?', 'Состояние света на кухне?'])
  assert.equal(classifyReadonlyQuestion(input),'kitchen_review',input);
 for(const input of ['Включи свет на кухне','Выключи свет на кухне'])
  assert.equal(classifyReadonlyQuestion(input),null);
 for(const input of ['А что на кухне?', 'Что со светом на кухне и в гостиной?', 'Какой свет на кухне;switch.vannaia_svet?', 'Свет во всём доме?'])
  assert.equal(classifyReadonlyQuestion(input),'unsupported_question',input);
 assert.equal(classifyReadonlyQuestion('Что со светом в тамбуре?'),'tambour');
});
