// Privacy-preserving MCP transport failure classification; no raw errors/URLs in output.
const codes=new Set(['ECONNREFUSED','ETIMEDOUT','ENETUNREACH','EHOSTUNREACH','ECONNRESET','ENOTFOUND','EAI_AGAIN']);
export function classifyMcpConnectionFailure(error){
 const code=error?.cause?.code??error?.code;
 if(codes.has(code))return code.toLowerCase();
 const message=typeof error?.message==='string'?error.message:'';
 if(/\bHTTP\s+40[13]\b/i.test(message))return 'http_access_denied';
 if(/\bHTTP\s+404\b/i.test(message))return 'http_not_found';
 if(/\bHTTP\s+50\d\b/i.test(message))return 'http_server_error';
 if(error?.name==='AbortError'||error?.cause?.name==='AbortError')return 'timeout';
 return 'connect_failed';
}
