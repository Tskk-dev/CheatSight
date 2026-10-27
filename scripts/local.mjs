import {spawn} from 'node:child_process';
import {createApp} from '../server/main.mjs';

const port=Number(process.env.PORT||3000),url=`http://localhost:${port}`;
try{
 const response=await fetch(url+'/health',{signal:AbortSignal.timeout(1000)});
 if(response.ok&&(await response.json()).app==='CheatSight'){
  console.log(`CheatSight is already running: ${url}`);
  process.exit(0);
 }
}catch{}
for(const args of [['node_modules/typescript/bin/tsc','--noEmit'],['node_modules/vite/bin/vite.js','build']]){
 const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('error',reject);child.on('exit',resolve);});
 if(code!==0)process.exit(typeof code==='number'?code:1);
}
const app=createApp();
app.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Close the other service or set PORT to another port.`:error.message);process.exit(1);});
app.listen(port,'0.0.0.0',()=>console.log(`\nCheatSight is running: ${url}\nCreate a session with your Google Form, or choose Start local test.\nKeep this process running while using the app.\n`));
const shutdown=()=>app.close(()=>process.exit(0));
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
