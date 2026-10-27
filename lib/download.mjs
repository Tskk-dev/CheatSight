import {summarize} from './monitor.mjs';
export function logCsv(session,people,events){
 const cells=value=>'"'+String(value??'').replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['Session','Session type','Student','Event','Timestamp (ISO)','Mouse samples on CheatSight','Event ID']];
 for(const event of [...events].sort((a,b)=>a.at-b.at)){
  rows.push([session?.title||'',session?.kind==='meet'?'Google Meet':'Test',people.find(p=>p.id===event.participant_id)?.name||'Student',event.type,new Date(event.at).toISOString(),event.type==='pointer'?event.value:'',event.id]);
 }
 return rows.map(row=>row.map(cells).join(',')).join('\r\n');
}
export function reportJson(session,people,events){
 return JSON.stringify({exportedAt:new Date().toISOString(),session,limitations:'Browser-reported activity on CheatSight only; excludes the Google Forms iframe and Google Meet call. Page visibility does not verify meeting attendance, cheating, or attention.',students:summarize(people.map(p=>({...p,session_ended_at:session?.ended_at})),events),events:[...events].sort((a,b)=>a.at-b.at)},null,2);
}
