import {sessionLink,meetIsActive} from './state.mjs';
let chain=Promise.resolve();
const serial=task=>{const run=chain.then(task);chain=run.catch(()=>{});return run;};
const read=async()=>(await chrome.storage.session.get('monitor')).monitor;
const save=monitor=>chrome.storage.session.set({monitor});
async function post(m,body){
 const response=await fetch(m.origin+'/api/monitor',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',...(m.token?{Authorization:'Bearer '+m.token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
 const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error||'Could not sync monitoring.'),{status:response.status});return data;
}
async function sync(m){
 const batch=m.queue.slice(0,100);
 try{
  const data=await post(m,{action:'telemetry',participantId:m.participantId,state:m.state,events:batch});
  const sent=new Set(batch.map(e=>e.id));m.queue=m.queue.filter(e=>!sent.has(e.id));m.error='';m.lastSync=Date.now();
  if(data.ended){m.running=false;await chrome.alarms.clear('monitor');}
 }catch(e){m.error=e.message;if(e.status===401||e.status===404){m.running=false;await chrome.alarms.clear('monitor');}}
 await save(m);await chrome.action.setBadgeText({text:m.running?(m.error?'!':m.state==='visible'?'ON':m.state==='awaiting'?'WAIT':'AWAY'):''});
}
async function check(){
 const m=await read();if(!m?.running)return;
 if(!m.finishing){
  const [windows,tabs]=await Promise.all([chrome.windows.getAll({windowTypes:['normal','popup']}),chrome.tabs.query({url:'https://meet.google.com/*'})]);
  const active=meetIsActive(m.meetUrl,windows,tabs),next=active?'visible':m.seenMeet?'hidden':'awaiting';
  if(active)m.seenMeet=true;
  if(next!==m.state){m.state=next;m.queue.push({id:crypto.randomUUID(),type:next,at:Date.now(),value:0});}
 }
 await save(m);if(m.queue.length||Date.now()-m.lastSync>=25000)await sync(m);
}
async function start(body){
 const existing=await read();if(existing?.running)throw Error('Finish your current monitoring session first.');
 const {origin,sessionId}=sessionLink(body.link);
 if(body.consent!==true||typeof body.name!=='string'||!body.name.trim()||body.name.trim().length>80)throw Error('Enter your display name and acknowledge monitoring.');
 if(!await chrome.permissions.contains({origins:[origin+'/*']}))throw Error('Allow access to your CheatSight site first.');
 const response=await fetch(origin+'/api/monitor?view=join&id='+sessionId,{credentials:'omit',signal:AbortSignal.timeout(10000)});const data=await response.json();
 if(!response.ok)throw Error(data.error||'Session unavailable.');if(data.session.kind!=='meet')throw Error('This is a Test session. Join it on the CheatSight website.');if(data.session.ended_at)throw Error('This session has ended.');
 const p=await post({origin},{action:'join',sessionId,name:body.name.trim(),consent:true,source:'meet_extension'});
 const m={origin,sessionId,title:data.session.title,meetUrl:data.session.meet_url,...p,running:true,finishing:false,state:'awaiting',seenMeet:false,queue:[],error:'',lastSync:0};
 await save(m);await chrome.alarms.create('monitor',{periodInMinutes:0.5});await check();return {ok:true};
}
async function finish(){const m=await read();if(!m?.running)return {ok:true};if(!m.finishing){m.finishing=true;m.queue.push({id:crypto.randomUUID(),type:'finished',at:Date.now(),value:0});}await save(m);await sync(m);return {ok:!m.running,error:m.running?'Not yet synced. Monitoring will stop once the finish event reaches the server.':''};}
chrome.runtime.onMessage.addListener((body,sender,reply)=>{
 if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL('popup.html'))return false;
 serial(async()=>{if(body.action==='start')return start(body);if(body.action==='finish')return finish();if(body.action==='status'){const m=await read();return m?{running:m.running,title:m.title,state:m.state,error:m.error,meetUrl:m.meetUrl,lastSync:m.lastSync,finishing:m.finishing}:{running:false};}return {error:'Unknown action.'};}).then(reply,e=>reply({error:e.message}));return true;
});
const changed=()=>{void serial(check).catch(()=>{});};
chrome.tabs.onActivated.addListener(changed);chrome.tabs.onUpdated.addListener(changed);chrome.tabs.onRemoved.addListener(changed);chrome.windows.onFocusChanged.addListener(changed);
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='monitor')changed();});
chrome.runtime.onStartup.addListener(changed);
