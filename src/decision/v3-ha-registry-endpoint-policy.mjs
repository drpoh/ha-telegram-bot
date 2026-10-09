// Pure configuration preflight; never opens a socket or validates credentials.
// DNS, certificates, redirect handling, and server authentication belong to a
// separately audited transport implementation. No endpoint comes from an LLM.
export function assessHaRegistryEndpoint({endpoint,credentialSource,tlsPinned=false,operatorConfigured=false}={}){
 const deny=reason=>({accepted:false,authorization:false,reason});
 if(typeof endpoint!=='string'||endpoint.length>512||typeof credentialSource!=='string')return deny('invalid_endpoint_configuration');
 let url;
 try{url=new URL(endpoint);}catch{return deny('invalid_endpoint_url');}
 if(url.protocol!=='wss:'||!url.hostname||url.username||url.password||url.hash||url.search||url.pathname!=='/api/websocket')
  return deny('unapproved_websocket_url');
 // Hosts must be explicitly bound by operator configuration. This is only
 // syntax validation, not evidence of ownership or successful TLS pinning.
 if(credentialSource!=='protected_local_secret'||tlsPinned!==true||operatorConfigured!==true)
  return deny('unverified_endpoint_provenance');
 return {accepted:true,authorization:false,status:'configuration_review_only'};
}
