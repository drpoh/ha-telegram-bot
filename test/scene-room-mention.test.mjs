import test from 'node:test';
import assert from 'node:assert/strict';
import { explicitSceneAreaMention as named } from '../src/scenes/room-mention.mjs';
test('Russian cases map to the same explicit room',()=>{
 assert.equal(named('Запомни свет в гостиной как Вечер','Гостиная'),true);
 assert.equal(named('Включи Вечер в кухне','Кухня'),true);
 assert.equal(named('Удали Вечер в сауне','Ванная и Сауна'),true);
 assert.equal(named('Создай сцену в ванной','Ванная и Сауна'),true);
});
test('different and missing rooms fail closed',()=>{
 assert.equal(named('Сцену Вечер в гостиной','Кухня'),false);
 assert.equal(named('Запусти сцену Вечер','Гостиная'),false);
 assert.equal(named('В кухне и гостиной Вечер','Кухня'),false);
});
