// Compact single-row progress. Real TTY: carriage-return overwrite without ANSI clearing
// or line wrapping. Piped local output: start/final and long-stall heartbeat only.
// CI: sparse checkpoints for review. No third-party package or new I/O.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const whole=n=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;

export function formatTestProgress({
 label,total,completed=0,failed=0,elapsedMs=0,tty=false,columns=40
}={}){
 const size=whole(total);
 const done=clamp(whole(completed),0,size);
 const errors=whole(failed);
 const percent=size===0?100:Math.floor(done*100/size);
 const seconds=Math.floor(whole(elapsedMs)/1000);
 if(!tty)return `TEST_PROGRESS ${label} ${done}/${size} (${percent}%) failed=${errors} elapsed=${seconds}s`;

 const name=label==='syntax'?'S':'T';
 const bar='#'.repeat(Math.round(percent*8/100))+'.'.repeat(8-Math.round(percent*8/100));
 const failure=errors?` !${errors}`:'';
 const layouts=[
  `${name} [${bar}] ${done}/${size} ${percent}%${failure} ${seconds}s`,
  `${name} ${done}/${size} ${percent}%${failure} ${seconds}s`,
  `${name} ${done}/${size} ${percent}%${failure}`,
  `${name} ${percent}%${failure}`
 ];
 // Reserve 2 terminal columns: printing the last terminal cell can wrap on
 // Termux/SSH even without a newline. No ANSI escape sequences are emitted.
 const maxWidth=Math.max(3,whole(columns)-2);
 return layouts.find(item=>item.length<=maxWidth)??layouts.at(-1).slice(0,maxWidth);
}

export function createTestProgress({
 label,total,stream=process.stdout,env=process.env,now=Date.now,heartbeatMs=1000
}={}){
 const size=whole(total);
 const name=typeof label==='string'&&/^[a-z][a-z0-9_-]{0,32}$/i.test(label)?label:'tests';
 const disabled=env?.RS_TEST_PROGRESS==='off';
 const tty=Boolean(stream?.isTTY)&&env?.CI!=='true'&&env?.TERM!=='dumb'&&env?.RS_TEST_PROGRESS!=='plain';
 const ci=env?.CI==='true'||env?.RS_TEST_PROGRESS==='plain';
 const start=now();
 let completed=0,failed=0,finished=false;
 let previousTTY='',lastBucket=-1,lastLoggedAt=0,lastLogDone=-1,lastLogFailures=-1;
 let lastTTYAt=0,lastTTYBucket=-1,lastTTYFailures=0;
 const elapsed=()=>Math.max(0,now()-start);

 const render=(final=false)=>{
  if(disabled)return;
  const labelText=formatTestProgress({
   label:name,total:size,completed,failed,elapsedMs:elapsed(),tty,columns:stream?.columns??40
  });
  if(tty){
   // At most 20 movement checkpoints plus infrequent 2s heartbeats.
   // Reprinting one short row avoids Termux soft wraps and scrolling logs.
   const bucket=size===0?20:Math.floor(completed*20/size);
   if(!final&&bucket<=lastTTYBucket&&failed<=lastTTYFailures&&elapsed()-lastTTYAt<2000)return;
   if(final||labelText!==previousTTY){
    const width=Math.max(labelText.length,previousTTY.length);
    stream.write('\r'+labelText.padEnd(width,' '));
    previousTTY=labelText;
   }
   lastTTYBucket=bucket;
   lastTTYFailures=failed;
   lastTTYAt=elapsed();
  }else{
   const bucket=size===0?10:Math.floor(completed*10/size);
   // CI keeps 10% diagnostics; a local pipe doesn't spam 10 progress lines.
   const milestone=ci?bucket>lastBucket:completed===0&&lastBucket<0;
   const stallMs=ci?20000:30000;
   if(final||milestone||failed>lastLogFailures||elapsed()-lastLoggedAt>=stallMs){
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
 const timer=!disabled&&heartbeatMs>0
  ?setInterval(()=>{if(!finished)render();},heartbeatMs)
  :null;
 timer?.unref?.();

 return {
  update({done=completed,errors=failed}={}){
   if(finished)return;
   completed=clamp(whole(done),completed,size);
   failed=whole(errors);
   render();
  },
  clearLine(){
   if(!finished&&tty&&previousTTY){
    stream.write('\r'+' '.repeat(previousTTY.length)+'\r');
    previousTTY='';
   }
  },
  finish({done=completed,errors=failed}={}){
   if(finished)return;
   completed=clamp(whole(done),completed,size);
   failed=whole(errors);
   if(timer)clearInterval(timer);
   render(true);
   if(tty&&!disabled)stream.write('\n');
   finished=true;
  }
 };
}
