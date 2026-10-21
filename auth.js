/* Comprueba que la petición viene de Cloudflare Access (JWT firmado). Si falta la configuración, NIEGA. */
const b64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const txt=s=>JSON.parse(new TextDecoder().decode(b64u(s)));
let claves={t:0,k:[]};
const leeClaves=async d=>{
 if(Date.now()-claves.t>36e5||!claves.k.length){const r=await fetch(`https://${d}/cdn-cgi/access/certs`);if(!r.ok)return [];claves={t:Date.now(),k:(await r.json()).keys||[]}}
 return claves.k};
export const esAdmin=async(req,env)=>{
 if(env.DEV==='1')return true;
 const t=req.headers.get('Cf-Access-Jwt-Assertion'),d=env.TEAM_DOMAIN,aud=env.POLICY_AUD;
 if(!t||!d||!aud)return false;
 try{
  const [h,p,s]=t.split('.');if(!s)return false;
  const hd=txt(h),pl=txt(p);
  if(hd.alg!=='RS256')return false;
  const jwk=(await leeClaves(d)).find(k=>k.kid===hd.kid);if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64u(s),new TextEncoder().encode(`${h}.${p}`)))return false;
  const audOk=[].concat(pl.aud).includes(aud);
  const lista=(env.ADMIN_EMAILS||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  return audOk&&pl.iss===`https://${d}`&&pl.exp>Date.now()/1e3&&(!lista.length||lista.includes(String(pl.email||'').toLowerCase()))
 }catch{return false}};