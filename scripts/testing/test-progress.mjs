// Progress for native Node tests. TTY: one updating line; CI/pipes: sparse log checkpoints.
// No external library, network access, test fixture details or credentials.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const whole=(n)=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;

export function formatTestProgress({label,total,completed=0,failed=0,elapsedMs=0,tty=false}){
 const size=whole(total);
 const done=clamp(whole(completed),0,size);
 const errors=whole(failed);
 const percent=size===0?100:Math.floor(done*100/size);
 const seconds=(whole(elapsedMs)/1000).toFixed(1);
 if(tty){
  const segments=Math.round(percent*20/100);
  return `${label} [${'█'.repeat(segments)}${'░'.repeat(20-segments)}] ${done}/${size} (${percent}%)  failures: ${errors}  ${seconds}s`;
 }
 return `TEST_PROGRESS ${label} ${done}/${size} (${percent}%) failed=${errors} elapsed=${seconds}s`;
}

export function createTestProgress({
 label,total,stream=process.stdout,env=process.env,now=Date.now,heartbeatMs=1000
}={}){
 const size=whole(total);
 const name=typeof label==='string'&&/^[a-z][a-z0-9_-]{0,32}$/i.test(label)?label:'tests';
 const disabled=env?.RS_TEST_PROGRESS==='off';
 const tty=Boolean(stream?.isTTY)&&env?.CI!=='true'&&env?.TERM!=='dumb'&&env?.RS_TEST_PROGRESS!=='plain';
 const start=now();
 let completed=0,failed=0,lastBucket=-1,lastLoggedAt=start,lastLogDone=-1,lastLogFailures=-1,lastTTY='',finished=false;
 const elapsed=()=>Math.max(0,now()-start);

 const render=(final=false)=>{
  if(disabled)return;
  const labelText=formatTestProgress({label:name,total:size,completed,failed,elapsedMs:elapsed(),tty});
  if(tty){
   if(final||labelText!==lastTTY)stream.write('\r\x1b[2K'+labelText);
   lastTTY=labelText;
  }else{
   const bucket=size===0?10:Math.floor(completed*10/size);
   if(final||bucket>lastBucket||failed>lastLogFailures||elapsed()-lastLoggedAt>=20000){
    if(!final||completed!==lastLogDone||failed!==lastLogFailures)
     stream.write(labelText+'\n');
    lastBucket=bucket;
    lastLoggedAt=elapsed();
    lastLogDone=completed;
    lastLogFailures=failed;
   }
  }
 };

 render();
 const interval=!disabled&&heartbeatMs>0
  ?setInterval(()=>{if(!finished)render();},heartbeatMs)
  :null;
 interval?.unref?.();

 return {
  update({done=completed,errors=failed}={}){
   if(finished)return;
   completed=clamp(whole(done),completed,size);
   failed=whole(errors);
   render();
  },
  clearLine(){
   if(!finished&&tty){
    stream.write('\r\x1b[2K');
    lastTTY='';
   }
  },
  finish({done=completed,errors=failed}={}){
   if(finished)return;
   completed=clamp(whole(done),completed,size);
   failed=whole(errors);
   if(interval)clearInterval(interval);
   render(true);
   if(tty)stream.write('\n');
   finished=true;
  }
 };
}
