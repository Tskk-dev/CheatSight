

import { formEmbed, eventTypes } from './monitor.mjs';

const json = (data, status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail = (message,status=400) => {throw Object.assign(new Error(message),{status});};
const text = (v,max) => typeof v === 'string' && v.trim().length>0 && v.trim().length<=max ? v.trim() : fail('Please check the required fields.');
const digest = async (v) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('');
async function run(request,db,getUser) {
  if(!db) return json({error:'The session database is unavailable.'},503);
  const u = new URL(request.url), id = u.searchParams.get('id');
  if(request.method === 'GET' && u.searchParams.get('view') === 'join') {
    const s = await db.prepare('SELECT id,title,form_url,duration,mouse,created_at,ended_at FROM sessions WHERE id=?').bind(id).first();
    return s ? json({session:s}) : json({error:'This session could not be found.'},404);
  }
  if(request.method === 'POST') {
    if(request.headers.get('Origin') && request.headers.get('Origin') !== u.origin) return json({error:'Cross-site request rejected.'},403);
    if(Number(request.headers.get('content-length')||0)>48000) return json({error:'Request too large.'},413);
    const raw = await request.text(); if(raw.length>48000) return json({error:'Request too large.'},413);
    let body;try {body=JSON.parse(raw);}catch{return json({error:'Invalid request.'},400);}
    if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request.'},400);
    const now = Date.now();
    if(body.action === 'join') {
      const s = await db.prepare('SELECT * FROM sessions WHERE id=?').bind(text(body.sessionId,100)).first();
      if(!s) return json({error:'This session could not be found.'},404);
      if(s.ended_at) return json({error:'This session has ended.'},409);
      if(body.consent !== true) return json({error:'Please acknowledge activity monitoring before joining.'},400);
      const count=await db.prepare('SELECT COUNT(*) AS n FROM participants WHERE session_id=?').bind(s.id).first();
      if(count.n>=300) return json({error:'This session is full.'},409);
      const pid=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();
      await db.batch([
        db.prepare('INSERT INTO participants (id,session_id,token_hash,name,joined_at,last_seen,state) VALUES (?,?,?,?,?,?,?)').bind(pid,s.id,await digest(token),text(body.name,80),now,now,'visible'),
        db.prepare('INSERT INTO events (id,participant_id,session_id,type,at,value) VALUES (?,?,?,?,?,0)').bind(crypto.randomUUID(),pid,s.id,'joined',now),
      ]);
      return json({participantId:pid,token,joinedAt:now});
    }
    if(body.action === 'telemetry') {
      const token=request.headers.get('Authorization')?.replace(/^Bearer /,'') || '';
      const p=await db.prepare('SELECT p.*,s.ended_at,s.mouse FROM participants p JOIN sessions s ON s.id=p.session_id WHERE p.id=? AND p.token_hash=?').bind(text(body.participantId,100),await digest(token)).first();
      if(!p) return json({error:'Please rejoin the session.'},401);
      if(p.ended_at || p.completed_at) return json({ended:true});
      if(!Array.isArray(body.events)||body.events.length>100) return json({error:'Invalid event batch.'},400);
      if(!['visible','hidden','blurred','form'].includes(body.state)) return json({error:'Invalid activity state.'},400);
      const inserts=[];
      for(const e of body.events) {
        if(!e||typeof e!=='object')return json({error:'Invalid activity event.'},400);
        if(!eventTypes.includes(e.type) || e.type==='joined' || typeof e.id!=='string' || !/^[a-f0-9-]{36}$/.test(e.id) || !Number.isSafeInteger(e.at) || e.at<p.joined_at-5000 || e.at>now+60000 || !Number.isInteger(e.value) || e.value<0 || e.value>100000) return json({error:'Invalid activity event.'},400);
        if(e.type==='pointer'&&!p.mouse) continue;
        inserts.push(db.prepare('INSERT OR IGNORE INTO events (id,participant_id,session_id,type,at,value) VALUES (?,?,?,?,?,?)').bind(e.id,p.id,p.session_id,e.type,e.at,e.value));
      }
      const finished=body.events.some((e)=>e.type==='finished');
      inserts.push(db.prepare('UPDATE participants SET last_seen=?,state=?,completed_at=? WHERE id=?').bind(now,body.state,finished?now:null,p.id));
      await db.batch(inserts);return json({ok:true,ended:finished});
    }
    const user = await getUser(); if(!user)return json({error:'Sign in to manage your sessions.'},401);
    if(body.action === 'create') {
      const title=text(body.title,120);let formUrl;try{formUrl=formEmbed(text(body.formUrl,2000));}catch(e){return json({error:e.message},400);}
      if(!Number.isInteger(body.duration)||body.duration<1||body.duration>240) return json({error:'Choose a duration between 1 and 240 minutes.'},400);
      const sid=crypto.randomUUID();
      await db.prepare('INSERT INTO sessions (id,owner_id,title,form_url,duration,mouse,created_at) VALUES (?,?,?,?,?,?,?)').bind(sid,user.userId,title,formUrl,body.duration,body.mouse?1:0,now).run();
      return json({id:sid});
    }
    const owned=await db.prepare('SELECT id FROM sessions WHERE id=? AND owner_id=?').bind(text(body.sessionId,100),user.userId).first();
    if(!owned)return json({error:'Session not found.'},404);
    if(body.action==='end') {
      await db.prepare('UPDATE sessions SET ended_at=COALESCE(ended_at,?) WHERE id=?').bind(now,body.sessionId).run();return json({ok:true});
    }
    return json({error:'Unknown action.'},400);
  }
  const user=await getUser();if(!user)return json({sessions:[],participants:[],events:[],signedIn:false});
  const sessions=(await db.prepare('SELECT * FROM sessions WHERE owner_id=? ORDER BY created_at DESC').bind(user.userId).all()).results;
  if(!id)return json({sessions,signedIn:true,name:user.displayName});
  const s=sessions.find((x)=>x.id===id);if(!s)return json({error:'Session not found.'},404);
  const participants=(await db.prepare('SELECT id,session_id,name,joined_at,last_seen,state,completed_at FROM participants WHERE session_id=? ORDER BY joined_at').bind(id).all()).results;
  const events=(await db.prepare('SELECT * FROM events WHERE session_id=? ORDER BY at DESC').bind(id).all()).results;
  return json({sessions,participants,events,signedIn:true,name:user.displayName});
}
export async function monitor(request,db,getUser) {try{return await run(request,db,getUser);}catch(e){console.error('Monitor request failed',e.message);return json({error:e.status?e.message:'Unable to load sessions. Please try again.'},e.status||500);}}
