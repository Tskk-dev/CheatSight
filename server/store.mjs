import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';

export function createStore(){
 const memory=new DatabaseSync(':memory:');
 memory.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 return {
  prepare(sql){const statement=memory.prepare(sql);return {bind(...args){return {run:()=>statement.run(...args),first:()=>statement.get(...args)||null,all:()=>({results:statement.all(...args)}),execute:()=>statement.run(...args)};}};},
  batch(statements){memory.exec('BEGIN');try{const result=statements.map(s=>s.execute());memory.exec('COMMIT');return result;}catch(e){memory.exec('ROLLBACK');throw e;}},
  expire(){memory.prepare('DELETE FROM sessions WHERE created_at < ?').run(Date.now()-24*60*60*1000);},
  close(){memory.close();}
 };
}
