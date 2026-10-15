// Pure interpretation of explicit duration in Russian light commands.
// No service calls, scheduling, device lookup, or implicit authorization.
const UNITS = {секунду:1,секунды:1,секунд:1,сек:1,минуту:60,минуты:60,минут:60,мин:60,час:3600,часа:3600,часов:3600};
const numberWords = {одну:1,один:1,одна:1,две:2,два:2,три:3,четыре:4,пять:5,десять:10,пятнадцать:15,тридцать:30};
export function parseTimedLightIntent(text) {
 const source=String(text||"").toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
 if (!/\b(?:свет|ламп[а-я]*|освещени[ея])\b/u.test(source)) return null;
 const action=/\b(?:выключи|выключить|погаси)\b/u.test(source)?'turn_off':/\b(?:включи|включить|зажги)\b/u.test(source)?'turn_on':null;
 if(!action) return null;
 const m=source.match(/\b(?:на|через)\s+(\d+|одну|один|одна|две|два|три|четыре|пять|десять|пятнадцать|тридцать)\s*(секунду|секунды|секунд|сек|минуту|минуты|минут|мин|час|часа|часов)\b/u);
 if(!m) return null;
 const n=/^\d+$/.test(m[1])?Number(m[1]):numberWords[m[1]];
 const durationSeconds=n*UNITS[m[2]];
 if(!Number.isSafeInteger(durationSeconds)||durationSeconds<=0||durationSeconds>86400) return {kind:'timed_light',valid:false,reason:'unsupported_duration'};
 return {kind:'timed_light',valid:true,action,durationSeconds,preposition:m[0].startsWith('через')?'через':'на'};
}
