import { neon } from '@neondatabase/serverless'

export default async function handler(req:any,res:any){
  if(req.method!=='GET') return res.status(405).json({ok:false,error:'method_not_allowed'})
  const url=process.env.DATABASE_URL
  if(!url) return res.status(503).json({ok:false,error:'backend_not_configured'})
  const sql=neon(url)
  const token=`SELFTEST-${Date.now()}`
  try{
    await sql`insert into shared_surveys (token, form_code, recipient_name, recipient_email, active, expires_at) values (${token}, 'F02', 'SYSTEM SELF TEST', 'selftest@local.invalid', true, now() + interval '10 minutes')`
    const rows=await sql`select token, form_code, recipient_name from shared_surveys where token=${token}`
    await sql`delete from shared_surveys where token=${token}`
    return res.status(200).json({ok:true,write:true,read:rows.length===1,cleanup:true})
  }catch(e:any){
    console.error('db-self-test',e)
    try{await sql`delete from shared_surveys where token=${token}`}catch{}
    return res.status(500).json({ok:false,error:'self_test_failed'})
  }
}
