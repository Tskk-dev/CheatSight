const now=Date.now();
export const demoSession={id:'demo',title:'Biology · Cell structure quiz',form_url:'',duration:45,mouse:1,created_at:now-18*60000,ended_at:null};
const names=['Olivia Chen','Liam Wilson','Emma Thompson','Noah Martinez','Ava Patel','Elijah Brown','Sophia Kim','James Anderson'];
export const demoPeople=names.map((name,i)=>({id:'demo-'+i,name,session_id:'demo',joined_at:now-18*60000+i*4000,last_seen:now,state:i===3?'hidden':i===5?'blurred':'form',completed_at:i===6?now-60000:null}));
export const demoEvents:any[]=[];
demoPeople.forEach((p,i)=>{
  demoEvents.push({id:p.id+'join',participant_id:p.id,session_id:'demo',type:'joined',at:p.joined_at,value:0});
  demoEvents.push({id:p.id+'pointer',participant_id:p.id,session_id:'demo',type:'pointer',at:now-30000,value:48+i*19});
  const count=i===3?3:i===1?2:i===5?1:0;
  for(let n=0;n<count;n++){
    const at=now-(count-n)*150000-i*1000;
    demoEvents.push({id:p.id+'h'+n,participant_id:p.id,type:'hidden',at,value:0});
    if(!(i===3&&n===count-1))demoEvents.push({id:p.id+'v'+n,participant_id:p.id,type:'visible',at:at+12000+n*6000,value:0});
  }
});
