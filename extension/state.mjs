export function sessionLink(input){
 let url;try{url=new URL(input.trim());}catch{throw Error('Paste your CheatSight student session link.');}
 if(!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))||url.username||url.password||!/^\/join\/[a-f0-9-]{36}\/?$/.test(url.pathname))throw Error('Use an HTTPS CheatSight student link, or localhost for testing.');
 return {origin:url.origin,sessionId:url.pathname.split('/')[2]};
}
export function meetIsActive(meetUrl,windows,tabs){
 const focused=windows.find(w=>w.focused&&!w.state?.includes('minimized'));
 if(!focused)return false;
 return tabs.some(tab=>{if(!tab.active||tab.windowId!==focused.id||!tab.url)return false;try{const url=new URL(tab.url);return url.protocol==='https:'&&url.hostname==='meet.google.com'&&url.origin+url.pathname.replace(/\/$/,'')===meetUrl;}catch{return false;}});
}
