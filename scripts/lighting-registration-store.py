#!/usr/bin/env python3
"""Persistent *review-only* lighting inventory on Pi; NEVER an AI authorization grant."""
import json,os,re,sys,tempfile
from pathlib import Path
ENTITY=re.compile(r'^light\.[a-z0-9_]+$')
ROOM=re.compile(r'^[a-z0-9_]{2,48}$')
def register(store, candidate, catalog):
    eid=candidate.get('entityId')
    if not isinstance(eid,str) or not ENTITY.fullmatch(eid): raise ValueError('invalid_entity')
    indexed={x['entity_id']:x for x in catalog['entities']}
    if eid not in indexed or indexed[eid].get('disabled'): raise ValueError('entity_not_in_active_catalog')
    name=candidate.get('name')
    room=candidate.get('room')
    if not isinstance(name,str) or not 1<=len(name.strip())<=80: raise ValueError('invalid_name')
    if not isinstance(room,str) or not ROOM.fullmatch(room): raise ValueError('invalid_room')
    if candidate.get('reviewMode')!='browser_demo_only': raise ValueError('unexpected_review_mode')
    store.setdefault('version',1)
    store.setdefault('devices',{})
    store['devices'][eid]={'entity_id':eid,'name':name.strip(),'room':room,
     'status':'pending_physical_verification','ai_authorized':False,
     'registry_platform':indexed[eid].get('platform')}
    return store
def main():
    if len(sys.argv)!=4: raise SystemExit('usage: script <store.json> <candidate.json> <catalog.json>')
    target=Path(sys.argv[1]); candidate=json.loads(Path(sys.argv[2]).read_text()); catalog=json.loads(Path(sys.argv[3]).read_text())
    target.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    os.chmod(target.parent,0o700)
    if target.is_symlink(): raise ValueError('unsafe_store_symlink')
    store=json.loads(target.read_text()) if target.exists() else {'version':1,'devices':{}}
    register(store,candidate,catalog)
    fd,tmp=tempfile.mkstemp(prefix='.lighting-',dir=target.parent)
    try:
        with os.fdopen(fd,'w') as f:
            json.dump(store,f,ensure_ascii=False,indent=2)
            f.flush();os.fsync(f.fileno())
        os.chmod(tmp,0o600)
        os.replace(tmp,target)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)
    print('STAGED_REVIEW_ONLY',candidate['entityId'])
if __name__=='__main__': main()
