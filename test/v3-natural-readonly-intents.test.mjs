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
 for(const input of ['Какой свет на кухне?', 'Сколько осталось до нагрева сауны?', 'Температура на улице?', 'Где мой телефон?'])
  assert.equal(classifyReadonlyQuestion(input),'unsupported_question');
 for(const input of ['Включи свет в тамбуре','Выключи свет в тамбуре'])
  assert.equal(classifyReadonlyQuestion(input),null);
});
