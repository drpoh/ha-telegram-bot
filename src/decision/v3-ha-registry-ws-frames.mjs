// Offline protocol state-machine for an injected, authenticated WebSocket.
// No network/client/token here. Only fixed read registry commands are emitted.
const reads=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
export function createRegistryFrameSession({maxMessageBytes=1048576}={}){
 if(!Number.isSafeInteger(maxMessageBytes)||maxMessageBytes<64||maxMessageBytes>4194304)throw Error('invalid_limit');
 let phase='auth_required',next=1,pending=null;
 const fail=(reason)=>{phase='failed';pending=null;return {ok:false,reason,authorization:false};};
 return {
  receive(frame){
   if(phase==='failed')return {ok:false,reason:'session_failed',authorization:false};
   if(typeof frame!=='string'||Buffer.byteLength(frame,'utf8')>maxMessageBytes)return fail('invalid_frame_size');
   let msg;try{msg=JSON.parse(frame);}catch{return fail('invalid_json');}
   if(!msg||typeof msg!=='object'||Array.isArray(msg))return fail('invalid_message');
   if(phase==='auth_required'){
    if(msg.type!=='auth_required')return fail('unexpected_auth_handshake');
    phase='await_auth';return {ok:true,status:'auth_required',authorization:false};
   }
   if(phase==='await_auth'){
    if(msg.type!=='auth_ok')return fail('authentication_rejected');
    phase='ready';return {ok:true,status:'authenticated_protocol_only',authorization:false};
   }
   if(phase!=='await_result'||msg.type!=='result'||msg.id!==pending||msg.success!==true||!Array.isArray(msg.result))return fail('invalid_registry_result');
   pending=null;phase='ready';return {ok:true,records:msg.result,authorization:false};
  },
  command(type){
   if(phase!=='ready'||!reads.has(type))return {ok:false,reason:'command_not_allowed',authorization:false};
   const id=next++;pending=id;phase='await_result';
   return {ok:true,frame:JSON.stringify({id,type}),authorization:false};
  },
  abort(){return fail('aborted');}
 };
}
