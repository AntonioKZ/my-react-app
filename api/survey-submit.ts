import { neon } from '@neondatabase/serverless'

export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'})
  const url=process.env.DATABASE_URL
  if(!url) return res.status(503).json({ok:false,error:'backend_not_configured'})
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body
    const {token,formCode,respondentName,respondentEmail,payload}=body||{}
    if(!token||!formCode||!payload) return res.status(400).json({ok:false,error:'invalid_payload'})
    const sql=neon(url)
    const link=await sql`select token,form_code,recipient_name,recipient_email,active,expires_at from shared_surveys where token=${token} limit 1`
    if(!link.length||!link[0].active) return res.status(404).json({ok:false,error:'invalid_or_inactive_link'})
    if(link[0].form_code!==formCode) return res.status(400).json({ok:false,error:'form_mismatch'})
    if(link[0].expires_at&&new Date(link[0].expires_at)<new Date()) return res.status(410).json({ok:false,error:'expired_link'})
    const name=respondentName||link[0].recipient_name||null
    const email=respondentEmail||link[0].recipient_email||null
    await sql`insert into survey_responses (form_code, respondent_token, respondent_name, respondent_email, payload, submitted_at, source)
      values (${formCode}, ${token}, ${name}, ${email}, ${JSON.stringify(payload)}, now(), 'PUBLIC_LINK')`
    await sql`update shared_surveys set active=false where token=${token}`
    return res.status(200).json({ok:true})
  }catch(e:any){
    console.error('survey-submit',e)
    return res.status(500).json({ok:false,error:'server_error'})
  }
}
