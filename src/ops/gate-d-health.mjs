export function parseUnit(raw){
 const fields=Object.fromEntries(String(raw).trim().split('\n').filter(line=>line.includes('=')).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
 return {active:fields.ActiveState==='active',enabled:fields.UnitFileState==='enabled',restarts:Number(fields.NRestarts||0),pid:Number(fields.MainPID||0)};
}
export function evaluateHealth(services){
 return services.every(s=>s.active&&s.enabled&&Number.isInteger(s.pid)&&s.pid>0);
}
// Minimal incident events: transitions only, never raw command output.
export function healthTransitions(previous,current){
 if(!previous)return [];
 const prior=new Map(previous.services.map(s=>[s.name,s]));
 return current.services.flatMap(s=>{
  const old=prior.get(s.name);
  if(!old)return [];
  const was=Boolean(old.active&&old.enabled&&old.pid>0);
  const now=Boolean(s.active&&s.enabled&&s.pid>0);
  if(was===now)return [];
  return [{at:current.at,service:s.name,event:now?'recovered':'unhealthy'}];
 });
}
