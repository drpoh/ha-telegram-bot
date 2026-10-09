export function parseUnit(raw){
 const fields=Object.fromEntries(String(raw).trim().split('\n').filter(line=>line.includes('=')).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
 return {active:fields.ActiveState==='active',enabled:fields.UnitFileState==='enabled',restarts:Number(fields.NRestarts||0),pid:Number(fields.MainPID||0)};
}
export function evaluateHealth(services){
 return services.every(s=>s.active&&s.enabled&&Number.isInteger(s.pid)&&s.pid>0);
}
