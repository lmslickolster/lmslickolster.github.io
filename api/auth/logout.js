const {options,json,clearCookie}=require('../_lib');
module.exports=async function(req,res){if(options(req,res))return;if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});clearCookie(res,'__Host-olster_admin');return json(res,200,{ok:true})};
