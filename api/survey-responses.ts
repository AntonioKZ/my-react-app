import { neon } from '@neondatabase/serverless'
export default async function handler(req:any,res:any){
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'})
 const url=process.env.DATABASE_URL;if(!url)return res.status(503).json({ok:false,error:'backend_not_configured'})
 try{const sql=neon(url);const rows=await sql`select r.id,r.form_code,r.respondent_token,coalesce(r.respondent_name,s.recipient_name) respondent_name,coalesce(r.respondent_email,s.recipient_email) respondent_email,
 case when r.form_code='F03' then r.payload || jsonb_build_object('functionName',coalesce(s.function_name,r.payload->>'functionName'),'role',coalesce(s.recipient_role,r.payload->>'role')) else r.payload end payload,
 r.submitted_at,r.source,s.created_at invited_at from survey_responses r left join shared_surveys s on s.token=r.respondent_token order by r.submitted_at desc limit 500`;return res.status(200).json({ok:true,items:rows})}catch(e){console.error('survey-responses',e);return res.status(500).json({ok:false,error:'server_error'})}
}
