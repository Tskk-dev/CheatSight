import {sessionLink} from './state.mjs';
const $=id=>document.getElementById(id);
let status={running:false};
async function refresh(){status=await chrome.runtime.sendMessage({action:'status'});$('connect').hidden=!!status.running;$('active').hidden=!status.running;$('status').textContent=status.running?'Monitoring connected':'Monitoring is off';$('title').textContent=status.title||'';$('state').textContent=status.finishing?'Finishing — waiting to sync':status.state==='visible'?'Assigned Meet tab is active':status.state==='hidden'?'Assigned Meet tab/window is not active':'Waiting for you to open the assigned Meet tab';$('error').textContent=status.error||'';}
$('connect').addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;$('error').textContent='';try{const link=$('link').value,{origin}=sessionLink(link);const granted=await chrome.permissions.request({origins:[origin+'/*']});if(!granted)throw Error('Site access is required to send your monitoring log.');const result=await chrome.runtime.sendMessage({action:'start',link,name:$('name').value,consent:$('consent').checked});if(result.error)throw Error(result.error);await refresh();}catch(error){$('error').textContent=error.message;}finally{button.disabled=false;}});
$('open').addEventListener('click',()=>{if(status.meetUrl)void chrome.tabs.create({url:status.meetUrl});});
$('finish').addEventListener('click',async()=>{const result=await chrome.runtime.sendMessage({action:'finish'});await refresh();if(result.error)$('error').textContent=result.error;});
void refresh();
