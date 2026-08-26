import { neon } from '@neondatabase/serverless'
import surveyLink from './survey-link.js'
import surveySubmit from './survey-submit.js'
import surveyResponses from './survey-responses.js'
import surveyImport from './survey-import.js'

type Out={status:number;body:any}
const call=async(fn:any,method:string,body?:any):Promise<Out>=>{let code=200,data:any=null;const req:any={method,body};const res:any={status(n:number){code=n;return this},json(x:any){data=x;return this}};await fn(req,res);return {status:code,body:data}}

export default async function handler(req:any,res:any){
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'})
 const url=process.env.DATABASE_URL
 if(!url)return res.status(503).json({ok:false,error:'backend_not_configured'})
 const sql=neon(url), tag=`QA-${Date.now()}`, tokens:string[]=[]
 const payloads:any={
  F01:{functionName:`${tag} Engineering`,mission:'Test mission',systems:'ERP, DMS',people:8},
  F02:{functionName:`${tag} Engineering`,role:'Engineer',skills:4,adoption:3,process:4,data:3,technology:4,governance:3},
  F03:{task:`${tag} Report mensile`,frequency:12,minutes:90,participants:2,cost:35,repeat:4,judgement:2,pain:'Manuale'},
  F04:{processName:`${tag} Gestione commessa`,owner:'QA Owner',lead:72,touch:12,volume:20,trigger:'Ordine',input:'Ordine',output:'Commessa',steps:'1-2-3',systems:'ERP',pain:'Attese'}
 }
 const checks:any={forms:{},duplicate:null,expired:null,identity:null,importStatus:null,cleanup:false}
 try{
  for(const formCode of ['F01','F02','F03','F04']){
   const l=await call(surveyLink,'POST',{formCode,recipientName:`${tag} ${formCode}`,recipientEmail:`${formCode.toLowerCase()}@qa.invalid`,expiresAt:new Date(Date.now()+3600000).toISOString()})
   if(l.status!==200)throw new Error(`link_${formCode}_${l.status}`);const token=l.body.token;tokens.push(token)
   const s=await call(surveySubmit,'POST',{token,formCode,payload:payloads[formCode]})
   checks.forms[formCode]={link:l.status,submit:s.status,ok:s.body?.ok===true}
  }
  const dup=await call(surveySubmit,'POST',{token:tokens[1],formCode:'F02',payload:payloads.F02});checks.duplicate={status:dup.status,pass:dup.status===404}
  const exp=await call(surveyLink,'POST',{formCode:'F02',recipientName:`${tag} EXPIRED`,recipientEmail:'expired@qa.invalid',expiresAt:new Date(Date.now()-60000).toISOString()});tokens.push(exp.body.token)
  const exs=await call(surveySubmit,'POST',{token:exp.body.token,formCode:'F02',payload:payloads.F02});checks.expired={status:exs.status,pass:exs.status===410}
  const inbox=await call(surveyResponses,'GET');const qa=(inbox.body?.items||[]).filter((x:any)=>tokens.includes(x.respondent_token));checks.identity={count:qa.length,pass:qa.length===4&&qa.every((x:any)=>x.respondent_name&&x.respondent_email)}
  const f02=qa.find((x:any)=>x.form_code==='F02');if(f02){const imp=await call(surveyImport,'POST',{id:f02.id});checks.importStatus={status:imp.status,pass:imp.status===200&&imp.body?.item?.source==='PUBLIC_LINK_IMPORTED'}}
  const allPass=Object.values(checks.forms).every((x:any)=>x.link===200&&x.submit===200&&x.ok)&&checks.duplicate?.pass&&checks.expired?.pass&&checks.identity?.pass&&checks.importStatus?.pass
  return res.status(allPass?200:500).json({ok:allPass,tag,checks})
 }catch(e:any){return res.status(500).json({ok:false,tag,error:e.message,checks})}
 finally{try{await sql`delete from survey_responses where respondent_token = any(${tokens})`;await sql`delete from shared_surveys where token = any(${tokens})`;checks.cleanup=true}catch(e){console.error('qa cleanup',e)}}
}
