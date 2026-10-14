// Injected Home Assistant JS WebSocket connection listener for registry changes.
// Source-only: no own socket, credentials, HA writes, process or Telegram poller.
// subscribeEvents returns Promise<unsubscribe>; connection lifecycle exposes
// ready/disconnected/reconnect-error. Never treats metadata as action approval.
const EVENTS=Object.freeze([
 'floor_registry_updated','area_registry_updated','device_registry_updated',
 'entity_registry_updated','label_registry_updated'
]);
export function createHARegistryEventObserver({
 connection,coordinator,debounceMs=1000,
 setTimeoutFn=setTimeout,clearTimeoutFn=clearTimeout
}={}){
 if(typeof connection?.subscribeEvents!=='function'||
    typeof connection?.addEventListener!=='function'||
    typeof connection?.removeEventListener!=='function'||
    typeof coordinator?.refresh!=='function'||
    typeof coordinator?.changed!=='function'||
    typeof coordinator?.disconnected!=='function'||
    typeof coordinator?.getStatus!=='function'||
    !Number.isSafeInteger(debounceMs)||debounceMs<50||debounceMs>10000)
   throw Error('invalid_registry_observer_contract');
 let stopped=false,started=false,connected=true,timer=null,reading=false,pending=false;
 const unsubscribe=[],handlers=[];
 const clear=()=>{if(timer!==null){clearTimeoutFn(timer);timer=null;}};
 const schedule=()=>{
  if(stopped||!connected)return;
  pending=true;
  clear();
  timer=setTimeoutFn(()=>{timer=null;void drain();},debounceMs);
 };
 async function drain(){
  if(stopped||!connected||reading||!pending)return;
  reading=true;pending=false;
  try{
   const result=await coordinator.refresh();
   // A registry event during the refresh may have invalidated the result.
   // One new debounced attempt will be queued instead of claiming fresh.
   if(!stopped&&connected&&result?.status!=='fresh'&&
      result?.reason==='concurrent_change')pending=true;
  }catch{/* coordinator is already stale and exceptions are not logged */}
  finally{
   reading=false;
   if(!stopped&&connected&&pending)schedule();
  }
 }
 const onChange=(eventType)=>()=>{
  if(stopped||!connected)return;
  coordinator.changed(eventType);
  schedule();
 };
 const onDisconnected=()=>{
  if(stopped)return;
  connected=false;clear();pending=false;
  coordinator.disconnected();
 };
 const onReady=()=>{
  if(stopped)return;
  connected=true;
  // Refresh every time the connection is authenticated/reconnected.
  // Autoresubscription is managed by upstream HA JS client.
  coordinator.disconnected();
  schedule();
 };
 async function start(){
  if(stopped)throw Error('observer_stopped');
  if(started)throw Error('observer_already_started');
  started=true;
  connection.addEventListener('ready',onReady);
  connection.addEventListener('disconnected',onDisconnected);
  connection.addEventListener('reconnect-error',onDisconnected);
  handlers.push(['ready',onReady],['disconnected',onDisconnected],
   ['reconnect-error',onDisconnected]);
  try{
   // Subscribe before snapshot to avoid the initial subscribe-vs-fetch gap.
   for(const name of EVENTS){
    const unsub=await connection.subscribeEvents(onChange(name),name);
    if(typeof unsub!=='function')throw Error('invalid_unsubscribe');
    unsubscribe.push(unsub);
    if(stopped)throw Error('observer_stopped');
   }
   coordinator.disconnected();
   schedule();
  }catch{
   await stop();
   throw Error('registry_subscription_failed');
  }
  return {status:'subscribed',subscriptions:EVENTS.length,
   writes:0,authorizesRead:false,authorizesWrite:false};
 }
 async function stop(){
  if(stopped)return;
  stopped=true;clear();pending=false;
  for(const [type,cb] of handlers)connection.removeEventListener(type,cb);
  for(const unsub of unsubscribe.splice(0))try{await unsub();}catch{}
  coordinator.disconnected();
 }
 return Object.freeze({
  start,stop,
  status:()=>Object.freeze({
   status:stopped?'stopped':started?'active':'not_started',
   subscriptions:stopped?0:unsubscribe.length,refreshQueued:pending,
   fresh:!stopped&&coordinator.getStatus().status==='fresh',
   authorizesRead:false,authorizesWrite:false
  })
 });
}
