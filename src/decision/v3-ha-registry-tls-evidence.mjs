import {timingSafeEqual} from 'node:crypto';

// Offline-only TLS peer evidence check. The trusted socket provider must verify
// the handshake and supply peer certificate fields; model input is never trusted.
export function assessRegistryTlsPeer({expectedHostname,expectedFingerprint256,peer}={}){
 const deny=reason=>({verified:false,authorization:false,reason});
 if(typeof expectedHostname!=='string'||!/^([a-z0-9-]+\.)+[a-z0-9-]+$/.test(expectedHostname)||
  typeof expectedFingerprint256!=='string'||!/^[a-f0-9]{64}$/i.test(expectedFingerprint256))return deny('invalid_pinned_configuration');
 if(peer?.authorized!==true||peer?.hostname!==expectedHostname||
  typeof peer?.fingerprint256!=='string'||!/^[a-f0-9]{64}$/i.test(peer.fingerprint256))return deny('unverified_tls_peer');
 const expected=Buffer.from(expectedFingerprint256,'hex');
 const actual=Buffer.from(peer.fingerprint256,'hex');
 if(!timingSafeEqual(expected,actual))return deny('certificate_pin_mismatch');
 return {verified:true,authorization:false,status:'offline_peer_evidence_only'};
}
