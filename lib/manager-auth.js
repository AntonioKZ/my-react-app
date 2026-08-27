import {createHash,timingSafeEqual} from 'node:crypto'
const COOKIE='aito_manager_session'
const password=()=>String(process.env.AITO_MANAGER_PASSWORD||'')
const token=()=>createHash('sha256').update(`aito-manager:${password()}`).digest('hex')
export const managerAuthConfigured=()=>password().length>=10
const cookies=req=>Object.fromEntries(String(req.headers?.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))
export const isManagerAuthenticated=req=>{if(!managerAuthConfigured())return true;const got=String(cookies(req)[COOKIE]||''),want=token();if(got.length!==want.length)return false;try{return timingSafeEqual(Buffer.from(got),Buffer.from(want))}catch{return false}}
export const requireManager=(req,res)=>{if(isManagerAuthenticated(req))return true;res.status(401).json({ok:false,error:'manager_auth_required'});return false}
export const setManagerCookie=res=>res.setHeader('Set-Cookie',`${COOKIE}=${token()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`)
export const clearManagerCookie=res=>res.setHeader('Set-Cookie',`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
export const verifyManagerPassword=value=>managerAuthConfigured()&&String(value||'')===password()
