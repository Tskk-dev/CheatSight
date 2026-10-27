export const eventTypes = ['joined','hidden','visible','window_blur','window_focus','form_focus','pointer','fullscreen_enter','fullscreen_exit','finished'];
export const isExtensionOrigin=value=>/^chrome-extension:\/\/[a-p]{32}$/.test(value||'');
export function formEmbed(input) {
  let url;
  try { url = new URL(input.trim()); } catch { throw new Error('Paste the full Google Forms responder URL.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !/^\/forms\/d\/(e\/)?[\w-]+\/viewform\/?$/.test(url.pathname)) throw new Error('Use a docs.google.com/forms/.../viewform link, not an editor or shortened link.');
  return url.origin + url.pathname.replace(/\/$/,'') + '?embedded=true';
}
export function meetLink(input) {
  if(input===undefined||input===null||input==='')return null;
  const error=()=>new Error('Use a Google Meet link like https://meet.google.com/abc-defg-hij.');
  if(typeof input!=='string'||input.length>2048)throw error();
  if(!input.trim())return null;
  let url;try{url=new URL(input.trim());}catch{throw error();}
  if(url.protocol!=='https:'||url.hostname!=='meet.google.com'||url.port||url.username||url.password||!/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}\/?$/i.test(url.pathname))throw error();
  return 'https://meet.google.com'+url.pathname.toLowerCase().replace(/\/$/,'');
}
export function summarize(people, events, now = Date.now()) {
  return people.map(p => {
    const log = events.filter(e => e.participant_id === p.id).sort((a,b) => a.at-b.at);
    let hiddenAt = null, away = 0, switches = 0, moves = 0;
    for (const e of log) {
      if(e.type === 'hidden' && hiddenAt === null) {hiddenAt = e.at; switches++;}
      if(e.type === 'visible' && hiddenAt !== null) {away += Math.max(0,e.at-hiddenAt); hiddenAt=null;}
      if(e.type === 'pointer') moves += e.value;
    }
    const end = p.completed_at || p.session_ended_at || now;
    if(hiddenAt !== null) away += Math.max(0,end-hiddenAt);
    return {...p, switches, moves, away, state: p.completed_at ? 'finished' : p.session_ended_at ? 'ended' : now-p.last_seen>(p.source==='meet_extension'?90000:35000) ? 'offline' : p.state};
  });
}
