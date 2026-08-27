import {neon} from '@neondatabase/serverless'
import {requireManager} from '../lib/manager-auth.js'
export default async function handler(req:any,res:any){
 if(!requireManager(req,res))return
 const url=process.env.DATABASE_URL
 if(!url)return res.status(503).json({ok:false,error:'backend_not_configured'})
 const sql=neon(url)
 try{
  await sql`create table if not exists journey_state (workspace_key text primary key, payload jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now())`
  if(req.method==='GET'){
   const rows=await sql`select payload,updated_at from journey_state where workspace_key='default'`
   return res.status(200).json({ok:true,payload:rows[0]?.payload||{},updatedAt:rows[0]?.updated_at||null})
  }
  if(req.method==='PUT'||req.method==='POST'){
   const body=typeof req.body==='string'?JSON.parse(req.body):req.body
   const payload=body?.payload
   if(!payload||typeof payload!=='object'||Array.isArray(payload))return res.status(400).json({ok:false,error:'invalid_payload'})
   const rows=await sql`insert into journey_state(workspace_key,payload,updated_at) values('default',${JSON.stringify(payload)}::jsonb,now()) on conflict(workspace_key) do update set payload=excluded.payload,updated_at=now() returning updated_at`
   return res.status(200).json({ok:true,updatedAt:rows[0].updated_at})
  }
  res.setHeader('Allow','GET, PUT, POST');return res.status(405).json({ok:false,error:'method_not_allowed'})
 }catch(e){console.error('journey-state',e);return res.status(500).json({ok:false,error:'journey_storage_error'})}
}
