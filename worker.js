import {esAdmin} from './auth.js';
const ENUM={comb:['Diésel','Gasolina','Híbrido','Eléctrico'],cambio:['Manual','Automático'],tipo:['Utilitario','Berlina','SUV','Familiar'],dgt:['','0','ECO','C','B','Sin etiqueta'],estado:['disponible','reservado','vendido']};
const SEL=`SELECT c.id,c.marca,c.modelo,c.anio,c.km,c.comb,c.cambio,c.tipo,c.precio,c.dgt,c.potencia,c.color,c.propietarios,c.descr AS "desc",c.estado,c.destacado,c.v,(SELECT COUNT(*) FROM fotos f WHERE f.car=c.id) AS fotos FROM coches c`;
const json=(d,s=200,h={})=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...h}});
const slug=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const aB64=b=>{const u=new Uint8Array(b);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s)};
const deB64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
const tipoImg=u=>u[0]===255&&u[1]===216&&u[2]===255?'image/jpeg':u[0]===82&&u[1]===73&&u[8]===87&&u[9]===69?'image/webp':'';
const MAX_FOTO=1.5e6,MAX_FOTOS=20;

const limpia=b=>{
 const e=[],s=(k,m)=>String(b[k]??'').trim().slice(0,m);
 const n=(k,lo,hi,req)=>{const v=b[k]===''||b[k]==null?null:Number(b[k]);
  if(v===null){req&&e.push(k);return null}
  if(!Number.isInteger(v)||v<lo||v>hi){e.push(k);return null}return v};
 const c={marca:s('marca',40),modelo:s('modelo',60),anio:n('anio',1950,new Date().getFullYear()+1,1),km:n('km',0,2e6,1),precio:n('precio',0,1e6,1),
  potencia:n('potencia',1,2000),propietarios:n('propietarios',1,20),color:s('color',30),descr:s('descr',3000),dgt:s('dgt',12),destacado:b.destacado?1:0};
 for(const k of['comb','cambio','tipo']){c[k]=s(k,20);ENUM[k].includes(c[k])||e.push(k)}
 ENUM.dgt.includes(c.dgt)||e.push('dgt');
 c.marca||e.push('marca');c.modelo||e.push('modelo');
 return{c,e}};

const COLS='marca,modelo,anio,km,precio,comb,cambio,tipo,dgt,potencia,color,propietarios,descr,destacado'.split(',');
const uno=(env,id)=>env.DB.prepare(`${SEL} WHERE c.id=?`).bind(id).first();

async function admin(req,env,p,m){
 let r;
 if(p==='/api/admin/coches'){
  if(m==='GET')return json((await env.DB.prepare(`${SEL} ORDER BY c.creado DESC`).all()).results);
  if(m==='POST'){
   const{c,e}=limpia(await req.json().catch(()=>({})));if(e.length)return json({error:'Datos no válidos',campos:e},400);
   const id=`${slug(c.marca+' '+c.modelo).slice(0,40)}-${c.anio}-${crypto.randomUUID().slice(0,4)}`;
   await env.DB.prepare(`INSERT INTO coches(id,${COLS},creado) VALUES(?,${COLS.map(()=>'?').join(',')},?)`).bind(id,...COLS.map(k=>c[k]),Date.now()).run();
   return json(await uno(env,id),201)}}
 if(r=p.match(/^\/api\/admin\/coches\/([^/]+)$/)){
  const id=r[1];
  if(m==='PUT'){
   const{c,e}=limpia(await req.json().catch(()=>({})));if(e.length)return json({error:'Datos no válidos',campos:e},400);
   const x=await env.DB.prepare(`UPDATE coches SET ${COLS.map(k=>k+'=?').join(',')} WHERE id=?`).bind(...COLS.map(k=>c[k]),id).run();
   return x.meta.changes?json(await uno(env,id)):json({error:'No existe'},404)}
  if(m==='DELETE'){
   await env.DB.batch([env.DB.prepare('DELETE FROM fotos WHERE car=?').bind(id),env.DB.prepare('DELETE FROM coches WHERE id=?').bind(id)]);
   return json({ok:true})}}
 if((r=p.match(/^\/api\/admin\/coches\/([^/]+)\/estado$/))&&m==='PUT'){
  const b=await req.json().catch(()=>({}));if(!ENUM.estado.includes(b.estado))return json({error:'Estado no válido'},400);
  const x=await env.DB.prepare('UPDATE coches SET estado=? WHERE id=?').bind(b.estado,r[1]).run();
  return x.meta.changes?json(await uno(env,r[1])):json({error:'No existe'},404)}
 if(r=p.match(/^\/api\/admin\/coches\/([^/]+)\/fotos$/)){
  if(m==='POST'){
   const id=r[1];if(!await uno(env,id))return json({error:'No existe'},404);
   if(+req.headers.get('content-length')>MAX_FOTO)return json({error:'Foto demasiado grande'},413);
   const buf=await req.arrayBuffer(),mime=tipoImg(new Uint8Array(buf.slice(0,12)));
   if(!mime||buf.byteLength>MAX_FOTO)return json({error:'Foto no válida'},400);
   const q=await env.DB.prepare('SELECT COUNT(*) n,COALESCE(MAX(pos),0) mx FROM fotos WHERE car=?').bind(id).first();
   if(q.n>=MAX_FOTOS)return json({error:`Máximo ${MAX_FOTOS} fotos por coche`},400);
   const pos=q.mx+1;
   await env.DB.batch([env.DB.prepare('INSERT INTO fotos(car,pos,mime,data) VALUES(?,?,?,?)').bind(id,pos,mime,aB64(buf)),env.DB.prepare('UPDATE coches SET v=v+1 WHERE id=?').bind(id)]);
   return json({pos},201)}}
 if((r=p.match(/^\/api\/admin\/coches\/([^/]+)\/fotos\/orden$/))&&m==='PUT'){
  const id=r[1],o=(await req.json().catch(()=>({}))).orden;
  if(!Array.isArray(o)||o.length>MAX_FOTOS||o.some(x=>!Number.isInteger(x)||x<1||x>999)||new Set(o).size!==o.length)return json({error:'Orden no válido'},400);
  await env.DB.batch([
   env.DB.prepare('UPDATE fotos SET pos=pos+1000 WHERE car=?').bind(id),
   ...o.map((x,i)=>env.DB.prepare('UPDATE fotos SET pos=? WHERE car=? AND pos=?').bind(i+1,id,x+1000)),
   env.DB.prepare('DELETE FROM fotos WHERE car=? AND pos>=1000').bind(id),
   env.DB.prepare('UPDATE coches SET v=v+1 WHERE id=?').bind(id)]);
  return json(await uno(env,id))}
 return json({error:'No encontrado'},404)}

export default{async fetch(req,env){
 const p=new URL(req.url).pathname,m=req.method;
 try{
  if(p==='/api/coches'&&m==='GET')
   return json((await env.DB.prepare(`${SEL} WHERE c.estado!='vendido' ORDER BY c.destacado DESC,c.creado DESC`).all()).results,200,{'cache-control':'public, max-age=60'});
  const f=p.match(/^\/fotos\/(.+)-(\d+)\.jpg$/);
  if(f&&m==='GET'){
   const r=await env.DB.prepare('SELECT mime,data FROM fotos WHERE car=? AND pos=?').bind(f[1],+f[2]).first();
   return r?new Response(deB64(r.data),{headers:{'content-type':r.mime,'x-content-type-options':'nosniff','cache-control':'public, max-age=31536000, immutable'}}):new Response('No encontrada',{status:404})}
  if(p.startsWith('/api/admin/')){
   if(!await esAdmin(req,env))return json({error:'No autorizado'},401);
   if(m!=='GET'&&req.headers.get('x-requested-with')!=='admin')return json({error:'Petición no válida'},403);
   return await admin(req,env,p,m)}
  return json({error:'No encontrado'},404)
 }catch(err){console.error(err);return json({error:'Error del servidor'},500)}}};