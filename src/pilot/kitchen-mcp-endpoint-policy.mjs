// Endpoint configuration is routing information, not proof of HA identity.
// Reject URL tricks that could send the MCP request to an unintended origin.
const HOSTS=new Set(['homeassistant.local','192.168.31.94','127.0.0.1','localhost']);
export function inspectKitchenMcpEndpoint(value){
 try{
  if(typeof value!=='string'||value!==value.trim())return {allowed:false,reason:'invalid_url'};
  const url=new URL(value);
  if(!['http:','https:'].includes(url.protocol)||!HOSTS.has(url.hostname)||
     url.username||url.password||url.hash||url.search||url.port==='0'||
     !url.pathname.startsWith('/')||url.pathname.includes('..'))
   return {allowed:false,reason:'endpoint_denied'};
  // HTTP outside loopback is not cryptographically authenticated. Do not
  // allow real release based on DNS/IP allowlisting alone.
  if(url.protocol==='http:'&&!['127.0.0.1','localhost'].includes(url.hostname))
   return {allowed:false,reason:'insecure_nonloopback_endpoint'};
  return {allowed:true,url};
 }catch{return {allowed:false,reason:'invalid_url'};}
}
