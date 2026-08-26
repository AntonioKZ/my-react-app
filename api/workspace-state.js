import { neon } from '@neondatabase/serverless';
const sql=neon(process.env.DATABASE_URL);
export default async function handler(req,res){
 try{
  if(req.method==='GET'){
   const rows=await sql`SELECT payload,revision,updated_at FROM workspace_state WHERE workspace_key='default'`;
   return res.status(200).json(rows[0]||{payload:{},revision:0});
  }
  if(req.method==='PUT'||req.method==='POST'){
   const payload=req.body?.payload??req.body??{};const expected=req.body?.expectedRevision;
   if(!payload||typeof payload!=='object'||Array.isArray(payload)) return res.status(400).json({error:'Invalid payload'});
   if(expected!==undefined&&expected!==null){const current=await sql`SELECT revision FROM workspace_state WHERE workspace_key='default'`;const rev=Number(current[0]?.revision||0);if(Number(expected)!==rev)return res.status(409).json({error:'revision_conflict',revision:rev});}
   const rows=await sql`INSERT INTO workspace_state(workspace_key,payload,revision,updated_at) VALUES ('default',${JSON.stringify(payload)}::jsonb,1,now()) ON CONFLICT(workspace_key) DO UPDATE SET payload=EXCLUDED.payload,revision=workspace_state.revision+1,updated_at=now() RETURNING revision,updated_at`;
   return res.status(200).json({ok:true,...rows[0]});
  }
  res.setHeader('Allow','GET, PUT, POST');return res.status(405).json({error:'Method not allowed'});
 }catch(e){console.error(e);return res.status(500).json({error:'Workspace storage error'});}
}