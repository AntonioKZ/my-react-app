import {clearManagerCookie} from '../lib/manager-auth.js'
export default function handler(req,res){if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});clearManagerCookie(res);return res.status(200).json({ok:true})}
