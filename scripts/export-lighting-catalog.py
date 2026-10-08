#!/usr/bin/env python3
"""Read-only export from a privately supplied HA registry snapshot; no HA writes."""
import json,sys,datetime
from pathlib import Path
source=Path(sys.argv[1]); target=Path(sys.argv[2])
raw=json.loads(source.read_text())
entries=raw['data']['entities']
items=[]
for e in entries:
    eid=e.get('entity_id','')
    if not eid.startswith('light.'): continue
    items.append({'entity_id':eid,'name':e.get('name') or e.get('original_name') or eid,
      'platform':e.get('platform'),'area_id':e.get('area_id'),
      'disabled':e.get('disabled_by') is not None})
items.sort(key=lambda o:o['entity_id'])
output={'schema_version':1,'source':'HA entity registry read-only snapshot',
 'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'stale_until_refresh':True,'entities':items}
target.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print('CATALOG_EXPORTED',len(items))
