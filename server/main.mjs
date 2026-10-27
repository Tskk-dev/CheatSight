import http from 'node:http';
import {randomBytes,createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStore} from './store.mjs';
import {monitor} from '../lib/monitor-api.mjs';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
export function createApp(){
 const db=createStore(),startedAt=Date.now(),staticRoot=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
 const server=http.createServer(async(req,res)=>{
  const canonical=process.env.PUBLIC_URL||process.env.RENDER_EXTERNAL_URL;
  const origin=canonical?new URL(canonical).origin:'http://'+req.headers.host;
  const url=new URL(req.url,origin);
  const secure=origin.startsWith('https:');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://docs.google.com https://accounts.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000');
  try{
   if(url.pathname==='/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,storage:'temporary-memory',startedAt}));return;}
   if(url.pathname==='/api/monitor'){
    if(!['GET','POST'].includes(req.method)){res.writeHead(405,{'Allow':'GET, POST'});res.end();return;}
    let body='';if(req.method==='POST'){
     if(req.headers.origin&&req.headers.origin!==origin){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Cross-site request rejected.'}));return;}
     for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>48000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Request too large.'}));return;}}
    }
    const match=(req.headers.cookie||'').match(/(?:^|;\s*)cheatsight_owner=([A-Za-z0-9_-]{43})(?:;|$)/);
    const credential=match?.[1]||randomBytes(32).toString('base64url');
    if(!match)res.setHeader('Set-Cookie',`cheatsight_owner=${credential}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure?'; Secure':''}`);
    const user={userId:createHash('sha256').update(credential).digest('hex'),displayName:'Facilitator'};
    const headers=new Headers();for(const [name,value]of Object.entries(req.headers))if(typeof value==='string')headers.set(name,value);
    const request=new Request(url,{method:req.method,headers,...(req.method==='POST'?{body}:{})});
    const response=await monitor(request,db,async()=>user);
    res.statusCode=response.status;response.headers.forEach((value,name)=>res.setHeader(name,value));res.end(await response.text());return;
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end('Invalid path');return;}
   if(pathname.includes('\0')||pathname.includes('\\')){res.writeHead(400);res.end('Invalid path');return;}
   let path=resolve(staticRoot,'.'+pathname);
   if(path!==staticRoot&&!path.startsWith(staticRoot+sep)){res.writeHead(403);res.end('Forbidden');return;}
   if(path===staticRoot||pathname.startsWith('/join/'))path=resolve(staticRoot,'index.html');
   const info=await stat(path).catch(()=>null);if(!info?.isFile()){res.writeHead(404);res.end('Not found');return;}
   res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control',pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache');
   if(req.method==='HEAD')res.end();else res.end(await readFile(path));
  }catch(error){console.error('Request failed:',error.message);if(!res.headersSent)res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Unable to process this request. Please try again.'}));}
 });
 const cleanup=setInterval(()=>db.expire(),60000);cleanup.unref();
 server.on('close',()=>{clearInterval(cleanup);db.close();});
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createApp(),port=Number(process.env.PORT||3000);
 server.listen(port,'0.0.0.0',()=>console.log(`CheatSight ready at http://127.0.0.1:${port}. Logs are temporary; download them before the server resets.`));
 const shutdown=()=>server.close(()=>process.exit(0));process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}
