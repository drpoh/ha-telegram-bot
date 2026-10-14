// Pure read-only room light question adapter. No credentials, IO, service calls or actions.
// Caller supplies fresh verified native HA registry catalog and separately authorized
// current light states. Metadata membership alone grants no permission to read or act.
const fail = reason => Object.freeze({status:'unverified',reason,authorizesRead:false,authorizesWrite:false});
const norm = value => typeof value==='string' ? value.trim().toLocaleLowerCase('ru') : '';
const requestedState = q => /(?:выключен|выключены|не горит|погашен)/u.test(q) ? 'off'
  : /(?:включен|включены|горит|горят|что включено)/u.test(q) ? 'on' : null;
const lightQuestion = q => /(?:свет|ламп|освещени|люстр|подсветк|какой выключен|какие выключены|что включено|что выключено)/u.test(q);
function matchedAreas(areas,question){
 return areas.filter(area=>{
  const name=norm(area.name);
  if(name.length<4)return false;
  const root=name.endsWith('ня')?name.slice(0,-1):name.endsWith('ая')?name.slice(0,-2):name;
  return question.includes(name)||(root.length>=4&&question.includes(root));
 });
}
export function answerRoomLightsReadOnly({catalog,question,context=null,stateById=null}={}){
 if(typeof question!=='string'||question.length>250)return fail('invalid_question');
 const q=norm(question);
 if(/(?:^|[^\\p{L}])(включи|выключи|переключи|удали|измени)(?=$|[^\\p{L}])/u.test(q))return fail('action_denied');
 if(!lightQuestion(q))return fail('unsupported_question');
 const target=requestedState(q);
 if(!target)return fail('state_not_specified');
 if(catalog?.status!=='validated_snapshot'||catalog.complete!==true||
  !Array.isArray(catalog.areas)||!Array.isArray(catalog.entities))return fail('catalog_not_fresh');
 const areas=matchedAreas(catalog.areas,q);
 if(areas.length>1)return fail('ambiguous_area');
 const previous=areas.length===0&&context?.kind==='room_lights'&&context?.areaId;
 const area=areas[0]??(previous?catalog.areas.find(a=>a.id===context.areaId):null);
 if(!area)return fail('area_not_identified');
 const lightEntities=catalog.entities.filter(e=>e.areaId===area.id&&e.domain==='light'&&e.enabled!==false&&!e.hidden);
 if(!lightEntities.length)return fail('no_light_entities');
 // Explicit caller authorization required; never treat registry enumeration as read authority.
 if(!stateById||typeof stateById!=='object')return fail('state_not_provided');
 const inspected=[];
 for(const e of lightEntities){
  const state=stateById[e.entityId];
  if(!state||typeof state!=='object'||!['on','off','unavailable','unknown'].includes(state.state))
   return fail('incomplete_or_untrusted_states');
  inspected.push({id:e.entityId,state:state.state,name:typeof state.name==='string'&&state.name.trim()?state.name.trim():e.entityId});
 }
 const matching=inspected.filter(e=>e.state===target);
 const unavailable=inspected.filter(e=>e.state==='unavailable'||e.state==='unknown').length;
 const label=target==='on'?'включён':'выключен';
 const text=matching.length
  ? `В комнате «${area.name}» ${target==='on'?'включены':'выключены'}: ${matching.map(e=>e.name).join(', ')}.`
  : `В комнате «${area.name}» нет света с подтверждённым состоянием «${label}».`;
 return Object.freeze({status:'answered',kind:'room_lights',text:unavailable?`${text} Недоступны или неизвестны: ${unavailable}.`:text,
  areaId:area.id,requestedState:target,observed:inspected.length,
  context:Object.freeze({kind:'room_lights',areaId:area.id}),authorizesRead:false,authorizesWrite:false});
}
