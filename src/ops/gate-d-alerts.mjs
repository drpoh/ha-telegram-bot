const names=new Set(['v2','v3','remote']);
export function alertText(event){
 if(!event||!names.has(event.service)||!['unhealthy','recovered'].includes(event.event)||!Number.isFinite(Date.parse(event.at)))throw Error('invalid_health_event');
 return `RS Home AI Gate D: ${event.service} ${event.event==='unhealthy'?'НЕ РАБОТАЕТ':'ВОССТАНОВЛЕН'} (${event.at}).`;
}
export function unsentEvents(events,deliveredIds){
 return events.filter(e=>!deliveredIds.has(`${e.at}|${e.service}|${e.event}`));
}
export function eventId(e){return `${e.at}|${e.service}|${e.event}`;}
