import { neon } from '@neondatabase/serverless'

export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'})
  const url=process.env.DATABASE_URL
  if(!url) return res.status(503).json({ok:false,error:'backend_not_configured'})
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body
    const {token,formCode,respondent,payload}=body||{}
    if(!token||!formCode||!payload) return res.status(400).json({ok:false,error:'invalid_payload'})
    const sql=neon(url)
    await sql`insert into survey_responses (survey_token, form_code, respondent, payload, submitted_at)
      values (${token}, ${formCode}, ${respondent||null}, ${JSON.stringify(payload)}, now())`
    await sql`update shared_surveys set status='COMPLETED', completed_at=now() where token=${token}`
    return res.status(200).json({ok:true})
  }catch(e:any){
    console.error('survey-submit',e)
    return res.status(500).json({ok:false,error:'server_error'})
  }
}
