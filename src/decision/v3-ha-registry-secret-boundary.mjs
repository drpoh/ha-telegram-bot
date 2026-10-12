// Offline dependency-injection boundary, never a credential manager or HA client.
// The trusted deployment must verify file ownership, permissions and TLS itself.
export async function inspectRegistrySecretBoundary({loadSecret,openSocket,performRead}={}){
 const deny=reason=>({accepted:false,authorization:false,reason});
 if(typeof loadSecret!=='function'||typeof openSocket!=='function'||typeof performRead!=='function')return deny('missing_protected_dependencies');
 let credential;
 try{
  credential=await loadSecret();
  if(typeof credential!=='string'||credential.length<16||credential.length>4096||/\s/.test(credential))
   return deny('invalid_secret');
  // Never return or log the credential. The socket factory must be injected by
  // trusted server-side code; model/request input must not supply this factory.
  const socket=await openSocket();
  if(!socket||typeof socket.exchange!=='function'||typeof socket.close!=='function')return deny('invalid_socket');
  try{
   const result=await performRead({socket,credential});
   return {accepted:result===true,authorization:false,status:'offline_boundary_only'};
  }finally{try{await socket.close();}catch{/* close failure cannot authorize */}}
 }catch{return deny('secret_or_socket_failure');}
}
