import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createApp} from './main.mjs';
import {logCsv,reportJson} from '../lib/download.mjs';

test('temporary sessions, facilitator isolation, telemetry, downloads, and resets',async()=>{
 let app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));
 let origin='http://127.0.0.1:'+app.address().port;
 const request=async(body,{cookie='',token='',query='',status=200,foreign=false}={})=>{
  const response=await fetch(origin+'/api/monitor'+query,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:foreign?'https://evil.test':origin,...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));return {data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
 };
 try{
  const owner=await request();const cookie=owner.cookie;assert.ok(cookie);assert.equal(owner.data.signedIn,true);
  const {data:{id}}=await request({action:'create',title:'QA session',formUrl:'https://docs.google.com/forms/d/e/example/viewform',duration:45,mouse:true},{cookie});
  await request({action:'create',title:'Unsafe form',formUrl:'https://evil.test/',duration:45},{cookie,status:400});
  const practice=(await request({action:'create',title:'Local monitoring test',source:'practice',duration:15,mouse:true},{cookie})).data;
  const practiceSession=(await request(undefined,{query:'?view=join&id='+practice.id})).data.session;
  assert.equal(practiceSession.form_url,'/practice-form');
  const practicePage=await fetch(origin+'/practice-form');assert.equal(practicePage.status,200);assert.ok((await practicePage.text()).includes('id="test-form"'));
  assert.equal((await fetch(origin+'/practice-form.js')).status,200);
  await request(undefined,{query:'?id='+practice.id,status:404});
  await request({action:'create',title:'CSRF',formUrl:'https://docs.google.com/forms/d/e/example/viewform',duration:45},{cookie,status:403,foreign:true});
  await request(undefined,{query:'?id='+id,status:404});
  await request({action:'end',sessionId:id},{status:404});
  const publicSession=(await request(undefined,{query:'?view=join&id='+id})).data.session;assert.ok(publicSession.form_url.endsWith('?embedded=true'));
  await request({action:'join',sessionId:id,name:'QA Student',consent:false},{status:400});
  const p=(await request({action:'join',sessionId:id,name:'=FORMULA Student',consent:true})).data;
  const at=Date.now(),events=[{id:crypto.randomUUID(),type:'hidden',at,value:0},{id:crypto.randomUUID(),type:'visible',at:at+10,value:0},{id:crypto.randomUUID(),type:'form_focus',at:at+11,value:0},{id:crypto.randomUUID(),type:'pointer',at:at+12,value:8}];
  const body={action:'telemetry',participantId:p.participantId,state:'form',events};
  await request(body,{token:'wrong',status:401});
  await request({...body,events:[null]},{token:p.token,status:400});
  await request(body,{token:p.token});await request(body,{token:p.token});
  const data=(await request(undefined,{cookie,query:'?id='+id})).data;
  assert.equal(data.events.length,5);assert.equal(data.participants.length,1);assert.equal(data.participants[0].token_hash,undefined);assert.equal(data.participants[0].state,'form');
  const csv=logCsv(publicSession,data.participants,data.events);assert.equal(csv.split('\r\n').length,6);assert.ok(csv.includes("'=FORMULA Student"));assert.ok(csv.includes('form_focus'));assert.ok(csv.includes('pointer'));
  const json=JSON.parse(reportJson(publicSession,data.participants,data.events));assert.equal(json.students[0].switches,1);assert.equal(json.students[0].moves,8);assert.equal(json.events.length,5);
  const finish=(await request({...body,events:[{id:crypto.randomUUID(),type:'finished',at:Date.now(),value:0}]},{token:p.token})).data;assert.equal(finish.ended,true);
  await request({action:'end',sessionId:id},{cookie});
  await request({action:'join',sessionId:id,name:'Late student',consent:true},{status:409});
  const health=await fetch(origin+'/health');assert.equal(health.status,200);assert.equal((await health.json()).storage,'temporary-memory');
  const staticResponse=await fetch(origin+'/');assert.equal(staticResponse.status,200);assert.ok((await staticResponse.text()).includes('CheatSight'));assert.ok(staticResponse.headers.get('content-security-policy').includes("frame-src 'self' https://docs.google.com"));
  const route=await fetch(origin+'/join/'+id);assert.equal(route.status,200);assert.ok((await route.text()).includes('/assets/'));
  await new Promise(r=>app.close(r));
  app=createApp();await new Promise(r=>app.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+app.address().port;
  const fresh=(await request(undefined,{cookie})).data;assert.equal(fresh.sessions.length,0,'A process restart must reset all session logs');
 }finally{await new Promise(r=>app.close(r));}
});
