import { neon } from '@neondatabase/serverless'

export default async function handler(req:any,res:any){
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'})
  const url=process.env.DATABASE_URL
  if(!url) return res.status(503).json({ok:false,error:'backend_not_configured'})
  const token=String(req.query?.token||'')
  if(!token) return res.status(400).json({ok:false,error:'missing_token'})
  try{
    const sql=neon(url)
    const rows=await sql`select token,form_code,recipient_name,recipient_email,function_name,recipient_role,active,expires_at from shared_surveys where token=${token} limit 1`
    if(!rows.length) return res.status(404).json({ok:false,error:'not_found'})
    return res.status(200).json({ok:true,item:rows[0]})
  }catch(e){console.error('survey-context',e);return res.status(500).json({ok:false,error:'server_error'})}
}
