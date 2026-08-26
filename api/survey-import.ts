import { neon } from '@neondatabase/serverless'

export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'})
  const url=process.env.DATABASE_URL
  if(!url) return res.status(503).json({ok:false,error:'backend_not_configured'})
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body
    const id=body?.id
    if(!id) return res.status(400).json({ok:false,error:'missing_id'})
    const sql=neon(url)
    const rows=await sql`update survey_responses set source='PUBLIC_LINK_IMPORTED' where id=${id} returning id,source`
    if(!rows.length) return res.status(404).json({ok:false,error:'not_found'})
    return res.status(200).json({ok:true,item:rows[0]})
  }catch(e){
    console.error('survey-import',e)
    return res.status(500).json({ok:false,error:'server_error'})
  }
}
