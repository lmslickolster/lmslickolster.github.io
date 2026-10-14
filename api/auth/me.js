const {options,json,session}=require('../_lib');
module.exports=async function(req,res){if(options(req,res))return;if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});const s=session(req);return json(res,200,{authenticated:!!s,login:s?s.login:null})};
