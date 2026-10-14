const crypto = require('crypto');

const SITE_ORIGINS = new Set([
  'https://olsterstudios.site',
  'https://www.olsterstudios.site',
  'https://lmslickolster.github.io'
]);
const OWNER = 'lmslickolster';
const REPO = 'lmslickolster.github.io';
const COOKIE = '__Host-olster_admin';

function cors(req,res) {
  const origin = req.headers.origin;
  if (origin && SITE_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
}
function options(req,res){cors(req,res);if(req.method==='OPTIONS'){res.status(204).end();return true}return false}
function json(res,status,data){res.status(status).setHeader('Content-Type','application/json; charset=utf-8').end(JSON.stringify(data))}
function secret(name){const v=process.env[name];if(!v)throw new Error('Missing server environment variable: '+name);return v}
function cookieValue(req,name){const raw=req.headers.cookie||'';for(const part of raw.split(';')){const i=part.indexOf('=');if(i>0&&part.slice(0,i).trim()===name)return decodeURIComponent(part.slice(i+1).trim())}return ''}
function cookie(res,name,value,maxAge,extra=''){res.setHeader('Set-Cookie',name+'='+encodeURIComponent(value)+'; Path=/; HttpOnly; Secure; SameSite=None; Max-Age='+maxAge+(extra?'; '+extra:''))}
function clearCookie(res,name){res.setHeader('Set-Cookie',name+'=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0')}
function key(){return crypto.createHash('sha256').update(secret('SESSION_SECRET')).digest()}
function encrypt(text){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);const data=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url')}
function decrypt(value){try{const b=Buffer.from(value,'base64url');const iv=b.subarray(0,12),tag=b.subarray(12,28),data=b.subarray(28);const decipher=crypto.createDecipheriv('aes-256-gcm',key(),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8')}catch{return null}}
function isAllowedOrigin(req){return !req.headers.origin||SITE_ORIGINS.has(req.headers.origin)}
function session(req){const value=cookieValue(req,COOKIE);if(!value)return null;const raw=decrypt(value);if(!raw)return null;try{const s=JSON.parse(raw);if(!s.exp||s.exp<Date.now()||s.login!==process.env.ADMIN_GITHUB_USERNAME)return null;return s}catch{return null}}
function setSession(res,login){cookie(res,COOKIE,encrypt(JSON.stringify({login,exp:Date.now()+7*24*60*60*1000})),7*24*60*60)}
async function github(path,options={}){const r=await fetch('https://api.github.com'+path,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+secret('GH_REPO_TOKEN'),...(options.headers||{})}});const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.message||'GitHub API request failed ('+r.status+')');return body}
function requireAdmin(req,res){const s=session(req);if(!s){json(res,401,{error:'Please sign in with the allowed GitHub account.'});return null}return s}
module.exports={SITE_ORIGINS,OWNER,REPO,COOKIE,cors,options,json,secret,cookieValue,cookie,clearCookie,encrypt,decrypt,session,setSession,github,requireAdmin,isAllowedOrigin};
