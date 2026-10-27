export const eventTypes = ['joined','hidden','visible','window_blur','window_focus','form_focus','pointer','fullscreen_enter','fullscreen_exit','finished'];
export function formEmbed(input) {
  let url;
  try { url = new URL(input.trim()); } catch { throw new Error('Paste the full Google Forms responder URL.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || !/^\/forms\/d\/(e\/)?[\w-]+\/viewform\/?$/.test(url.pathname)) throw new Error('Use a docs.google.com/forms/.../viewform link, not an editor or shortened link.');
  return url.origin + url.pathname.replace(/\/$/,'') + '?embedded=true';
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
    return {...p, switches, moves, away, state: p.completed_at ? 'finished' : p.session_ended_at ? 'ended' : now-p.last_seen>35000 ? 'offline' : p.state};
  });
}
