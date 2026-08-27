import {isManagerAuthenticated,managerAuthConfigured} from '../lib/manager-auth.js'
export default function handler(req,res){if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});return res.status(200).json({ok:true,configured:managerAuthConfigured(),authenticated:isManagerAuthenticated(req)})}
