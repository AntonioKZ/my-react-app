import { neon } from '@neondatabase/serverless'
const token=()=>crypto.randomUUID().replaceAll('-','')
export default async function handler(req:any,res:any){
 const url=process.env.DATABASE_URL
 if(!url)return res.status(503).json({ok:false,error:'backend_not_configured'})
 const sql=neon(url)
 try{
  await sql`alter table shared_surveys add column if not exists function_name text`
  await sql`alter table shared_surveys add column if not exists recipient_role text`
  if(req.method==='POST'){
   const b=typeof req.body==='string'?JSON.parse(req.body):req.body; const t=token()
   await sql`insert into shared_surveys (token,form_code,recipient_name,recipient_email,active,expires_at,created_at,function_name,recipient_role) values (${t},${b.formCode},${b.recipientName||null},${b.recipientEmail||null},true,${b.expiresAt||null},now(),${b.functionName||null},${b.recipientRole||null})`
   return res.status(200).json({ok:true,token:t})
  }
  if(req.method==='GET'){
   const rows=await sql`select s.token,s.form_code,s.recipient_name,s.recipient_email,s.active,s.expires_at,s.created_at,s.function_name,s.recipient_role,(select max(r.submitted_at) from survey_responses r where r.respondent_token=s.token) submitted_at from shared_surveys s order by s.created_at desc limit 500`
   return res.status(200).json({ok:true,items:rows})
  }
  return res.status(405).json({ok:false,error:'method_not_allowed'})
 }catch(e){console.error('survey-link',e);return res.status(500).json({ok:false,error:'server_error'})}
}
