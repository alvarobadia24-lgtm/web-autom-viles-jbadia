/* AutosJBS · comportamiento de la parte pública.
   marco()   pinta cabecera, pie, menú móvil y buscador.
   iniciar() arranca lo que haya en la página abierta (inicio, catálogo, ficha…). */
document.head.insertAdjacentHTML('beforeend','<link rel="icon" href="favicon.png" type="image/png">');
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cuantos=l=>`${l} ${l===1?'coche':'coches'}`;
const ir=u=>RUTA.ir?RUTA.ir(u):location.href=u;
let limpia=[],introVista=false;

/* ---------- Cabecera, pie, menú y buscador ---------- */
function marco(){
 $('#cab').innerHTML=Header();$('#pie').innerHTML=Footer();
 if(!$('.wa-f'))document.body.insertAdjacentHTML('beforeend',`<a class="wa-f" href="${wa('Hola, quería información')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICO.wa}</a>`);
 const menu=$('#movil'),busca=$('#busca'),q=$('#q-busca'),res=$('#busca-res');
 const cierra=d=>{d.classList.add('sale');setTimeout(()=>{d.classList.remove('sale');d.open&&d.close()},QUIETO?0:220)};
 $('#abre-menu').onclick=()=>menu.showModal();
 $$('[data-cierra]',menu).forEach(b=>b.onclick=()=>cierra(menu));
 menu.onclick=e=>e.target.closest('a')&&menu.close();
 /* Buscador: resultados al instante */
 const pinta=()=>{
  const t=norm(q.value.trim()),l=t?COCHES.filter(c=>norm(nombre(c)+' '+c.tipo+' '+c.comb).includes(t)):COCHES.filter(c=>c.destacado).concat(COCHES).filter((c,i,a)=>a.indexOf(c)===i);
  res.innerHTML=(t?`<p class="busca-n">${l.length?cuantos(l.length)+(l.length===1?' encontrado':' encontrados'):'No tenemos ahora ningún coche así'}</p>`:`<div class="busca-tipos"><a href="coches.html">Todos</a>${TIPOS.map(x=>`<a href="coches.html?tipo=${encodeURIComponent(x)}">${TIPOS_ETQ[x]}</a>`).join('')}</div>`)
   +l.slice(0,5).map((c,i)=>`<a class="busca-fila" style="--i:${i}" href="${fichaUrl(c)}"><span class="foto" data-m="${esc(c.marca)}">${Foto(c,1,'width="96" height="72" loading="lazy"')}</span><span><b>${esc(nombre(c))}</b><small>${c.anio} · ${num.format(c.km)} km · ${esc(c.comb)}</small></span><strong>${eur.format(c.precio)}</strong></a>`).join('')
   +(t&&l.length>5?`<a class="btn osc" href="coches.html?q=${encodeURIComponent(q.value.trim())}">Ver los ${l.length}</a>`:'')
   +(t&&!l.length?`<a class="btn oro" href="${wa('Hola, busco un '+q.value.trim())}" target="_blank" rel="noopener">${ICO.wa}Pedir ese coche</a>`:'')};
 $('#abre-busca').onclick=()=>{busca.showModal();q.value='';pinta();q.focus()};
 q.oninput=pinta;
 q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();q.value.trim()&&(busca.close(),ir('coches.html?q='+encodeURIComponent(q.value.trim())))}};
 busca.onclick=e=>{(e.target===busca||e.target.closest('a'))&&busca.close()};
}

/* Cabecera que se recoge al bajar y vuelve al subir + barra de avance */
let y0=0,enCola=false;
addEventListener('scroll',()=>{if(enCola)return;enCola=true;requestAnimationFrame(()=>{
 enCola=false;const y=scrollY,c=$('#cabecera'),p=$('#progreso');if(!c)return;
 c.classList.toggle('pegada',y>24);c.classList.toggle('oculta',y>420&&y>y0);
 if(p)p.style.transform=`scaleX(${Math.min(1,y/Math.max(1,document.documentElement.scrollHeight-innerHeight))})`;
 y0=y})},{passive:true});

/* ---------- Animaciones comunes ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('vis');io.unobserve(e.target);
 e.target.dataset.cuenta&&cuenta(e.target)}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
const reveal=()=>$$('.rev:not(.vis),[data-cuenta]:not(.vis)').forEach(e=>io.observe(e));
/* Números que suben hasta su valor */
function cuenta(el){
 const fin=+el.dataset.cuenta;if(QUIETO||!fin){el.textContent=num.format(fin);return}
 const t0=performance.now(),d=1300;
 const paso=t=>{const k=Math.min(1,(t-t0)/d);el.textContent=num.format(Math.round(fin*(1-Math.pow(1-k,3))));k<1&&requestAnimationFrame(paso)};
 requestAnimationFrame(paso)}
/* Lista de coches con cambio animado cuando el navegador lo permite */
const conCambio=f=>document.startViewTransition&&!QUIETO?document.startViewTransition(f):f();

/* ---------- Página ---------- */
function iniciar(){
limpia.forEach(f=>f());limpia=[];
const P=RUTA.pag,Q=RUTA.q;
document.body.dataset.pag=P;
const seg=(f,ms)=>{const t=setInterval(f,ms);limpia.push(()=>clearInterval(t));return t};
const tecla=f=>{document.addEventListener('keydown',f);limpia.push(()=>document.removeEventListener('keydown',f))};
ERROR_CARGA&&!$('.aviso-carga')&&$('#main').insertAdjacentHTML('afterbegin','<p class="wrap aviso-carga" role="alert">Ahora mismo no podemos cargar los coches. Inténtalo de nuevo en unos minutos o llámanos al '+NEGOCIO.telTxt+'.</p>');
const opts=(a,t)=>a.map(v=>`<option value="${esc(v)}">${esc(t?t(v):v)}</option>`).join('');
const uniq=k=>[...new Set(COCHES.map(c=>c[k]))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
const aplica=(c,s)=>(!s.q||norm(c.marca+' '+c.modelo).includes(norm(s.q)))&&(!s.marca||!s.marca.length||s.marca.includes(c.marca))
 &&(!s.tipo||c.tipo===s.tipo)&&(!s.gama||gamaDe(c.precio)===s.gama)&&(!s.comb||c.comb===s.comb)&&(!s.cambio||c.cambio===s.cambio)
 &&(!s.pmin||c.precio>=+s.pmin)&&(!s.pmax||c.precio<=+s.pmax)&&(!s.anio||c.anio>=+s.anio)&&(!s.km||c.km<=+s.km);
const ORDEN={'precio-asc':(a,b)=>a.precio-b.precio,'precio-desc':(a,b)=>b.precio-a.precio,'anio-desc':(a,b)=>b.anio-a.anio,'km-asc':(a,b)=>a.km-b.km};
const porGama=g=>COCHES.filter(c=>gamaDe(c.precio)===g);

/* ----- Inicio ----- */
if($('#rapida')){
 /* Entrada con el escudo: solo al llegar desde fuera de la web */
 if(!introVista&&!QUIETO&&!(document.referrer&&document.referrer.includes(location.host))){
  document.body.insertAdjacentHTML('beforeend','<div class="intro" aria-hidden="true"><img src="logo-icono.png" alt="" width="120" height="120"><i></i></div>');
  const n=$('.intro');n.addEventListener('animationend',e=>e.target===n&&n.remove());setTimeout(()=>n.remove(),2200)}
 introVista=true;

 const f=$('#rapida');
 $('#h-marca').innerHTML='<option value="">Todas</option>'+opts(uniq('marca'));
 $('#h-pmax').innerHTML='<option value="">Sin límite</option>'+opts([5000,10000,15000,20000,30000],v=>'Hasta '+eur.format(v));
 $('#h-comb').innerHTML='<option value="">Todos</option>'+opts(uniq('comb'));
 const total=()=>{const d=Object.fromEntries(new FormData(f));
  $('#h-ver span').textContent='Ver '+cuantos(COCHES.filter(c=>aplica(c,{marca:d.marca?[d.marca]:[],pmax:d.pmax,comb:d.comb})).length)};
 f.onchange=total;total();
 f.onsubmit=e=>{e.preventDefault();const u=new URLSearchParams([...new FormData(f)].filter(x=>x[1]));ir('coches.html'+(u.toString()?'?'+u:''))};

 const dest=(COCHES.some(c=>c.destacado)?COCHES.filter(c=>c.destacado):['alta','media','eco'].flatMap(g=>porGama(g).slice(0,2))).slice(0,6);

 /* Pase de coches de la portada */
 const pase=$('#pase'),S=dest.slice(0,5);
 if(S.length){
  pase.innerHTML=`<div class="pase-marco">${S.map((c,i)=>`<a class="pase-s${i?'':' on'}" href="${fichaUrl(c)}" ${i?'tabindex="-1" aria-hidden="true"':''} data-m="${esc(c.marca)}">${Foto(c,1,`width="960" height="720" ${i?'decoding="async"':'fetchpriority="high"'}`)}
<span class="pase-pie"><span><small>${c.anio} · ${num.format(c.km)} km · ${esc(c.comb)}</small><b>${esc(nombre(c))}</b></span><strong>${eur.format(c.precio)}</strong></span></a>`).join('')}
<div class="pase-barras" aria-hidden="true">${S.map((_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</div></div>
${S.length>1?`<div class="pase-ctrl"><button class="redondo" type="button" data-d="-1" aria-label="Coche anterior">${ICO.izq}</button><span id="pase-n" aria-live="polite">1 / ${S.length}</span><button class="redondo" type="button" data-d="1" aria-label="Coche siguiente">${ICO.der}</button></div>`:''}`;
  let k=0,parado=false;const sl=$$('.pase-s',pase),ba=$$('.pase-barras i',pase);
  const pon=i=>{k=(i+S.length)%S.length;sl.forEach((s,j)=>{s.classList.toggle('on',j===k);s.tabIndex=j===k?0:-1;s.setAttribute('aria-hidden',j!==k)});
   ba.forEach((b,j)=>{b.classList.remove('on');b.classList.toggle('hecha',j<k);j===k&&(void b.offsetWidth,b.classList.add('on'))});
   $('#pase-n')&&($('#pase-n').textContent=`${k+1} / ${S.length}`)};
  if(S.length>1){
   $$('[data-d]',pase).forEach(b=>b.onclick=()=>pon(k+ +b.dataset.d));
   pase.onpointerenter=()=>{parado=true;pase.classList.add('pausa')};pase.onpointerleave=()=>{parado=false;pase.classList.remove('pausa')};
   pase.onfocusin=pase.onpointerenter;pase.onfocusout=pase.onpointerleave;
   let x0=0;pase.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
   pase.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;Math.abs(d)>50&&pon(k+(d<0?1:-1))});
   QUIETO||seg(()=>!parado&&!document.hidden&&pon(k+1),5200)}
  /* El marco sigue un poco al ratón */
  if(!QUIETO&&matchMedia('(hover:hover) and (pointer:fine)').matches){const h=$('.hero'),m=$('.pase-marco',pase);
   h.onpointermove=e=>{const r=h.getBoundingClientRect();m.style.setProperty('--gx',((e.clientX-r.left)/r.width-.5).toFixed(3));m.style.setProperty('--gy',((e.clientY-r.top)/r.height-.5).toFixed(3))};
   h.onpointerleave=()=>{m.style.setProperty('--gx',0);m.style.setProperty('--gy',0)}}
 }else pase.innerHTML='<div class="pase-marco vacio-m"><img src="logo-icono.png" alt="" width="192" height="192"></div>';

 /* Cinta con las marcas que hay ahora mismo */
 const ms=uniq('marca'),ci=$('#cinta');
 if(ms.length>2){const tira=`<span>${ms.map(m=>`<a href="coches.html?marca=${encodeURIComponent(m)}">${esc(m)}</a>`).join('')}</span>`;
  ci.innerHTML=tira+tira.replace('<span>','<span aria-hidden="true">').replace(/<a /g,'<a tabindex="-1" ');ci.parentElement.hidden=false}
 else ci.parentElement.hidden=true;

 $('#n-coches').dataset.cuenta=COCHES.length;$('#n-coches').textContent=COCHES.length;
 $('#h-todos')&&($('#h-todos').textContent=COCHES.length?`Ver los ${COCHES.length} coches`:'Ver los coches');

 $$('[data-gama]').forEach(a=>{const l=porGama(a.dataset.gama).sort((x,y)=>y.precio-x.precio),c=l[0];
  $('.desde',a).textContent=l.length?'Desde '+eur.format(Math.min(...l.map(c=>c.precio))):'Consúltanos';$('.n',a).textContent=cuantos(l.length);
  $('.gama-foto',a).innerHTML=c?Foto(c,1,'width="640" height="480" loading="lazy"'):''});

 $('#destacados').innerHTML=!dest.length?'<p class="sin-coches">Pronto añadiremos coches. Llámanos o escríbenos y te contamos qué tenemos.</p>':dest.map((c,i)=>CocheCard(c,true).replace('class="coche rev"',`class="coche rev" style="--i:${i%4}"`)).join('');
 const ca=$('#destacados');
 $$('[data-carril]').forEach(b=>{b.hidden=dest.length<2;b.onclick=()=>ca.scrollBy({left:+b.dataset.carril*(($('.coche',ca)||ca).offsetWidth+20),behavior:QUIETO?'auto':'smooth'})});
 $('#todos').textContent=`Ver los ${COCHES.length} coches`;
}

/* ----- Catálogo ----- */
if($('#filtros')){
 const f=$('#filtros'),lat=$('#lateral'),tabs=$('#tabs');
 f.innerHTML=Filtros();
 for(const k of ['q','tipo','gama','comb','cambio','pmin','pmax','anio','km','orden'])if(f.elements[k])f.elements[k].value=Q.get(k)||'';
 $$('[name=marca]',f).forEach(x=>x.checked=Q.getAll('marca').includes(x.value));
 tabs.innerHTML=[['','Todos',COCHES.length],...TIPOS.map(t=>[t,TIPOS_ETQ[t],COCHES.filter(c=>c.tipo===t).length])].map(([v,t,n])=>`<button type="button" role="tab" data-v="${v}">${t}<small>${n}</small></button>`).join('');
 const estado=()=>{const d=new FormData(f);return{...Object.fromEntries(d),marca:d.getAll('marca')}};
 const ETQ={q:v=>`“${v}”`,tipo:v=>TIPOS_ETQ[v]||v,gama:v=>GAMAS[v],pmin:v=>'Desde '+eur.format(v),pmax:v=>'Hasta '+eur.format(v),anio:v=>'Desde '+v,km:v=>'Hasta '+num.format(v)+' km'};
 const pinta=()=>{
  const s=estado(),l=COCHES.filter(c=>aplica(c,s));
  if(ORDEN[s.orden])l.sort(ORDEN[s.orden]);
  $('#lista').innerHTML=l.map(c=>CocheCard(c)).join('');
  $$('#lista .coche').forEach(e=>e.style.viewTransitionName='c-'+e.dataset.id.replace(/[^a-zA-Z0-9_-]/g,'_'));
  $('#vacio').hidden=l.length>0;
  $('#cuenta').textContent=cuantos(l.length);$('#ver-res').textContent='Ver '+cuantos(l.length);
  const ch=Object.entries(s).filter(([k])=>k!=='orden').flatMap(([k,v])=>[].concat(v).filter(Boolean).map(x=>Chip(k,x,ETQ[k]?ETQ[k](x):x)));
  $('#chips').innerHTML=ch.join('');$('#n-filtros').textContent=ch.length||'';$('#n-filtros').hidden=!ch.length;
  $$('button',tabs).forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===(s.tipo||''))));
  const u=new URLSearchParams();Object.entries(s).forEach(([k,v])=>[].concat(v).forEach(x=>x&&u.append(k,x)));
  RUTA.pon(u.toString())};
 const pintar=()=>lat.classList.contains('abierta')?pinta():conCambio(pinta);
 const borrar=()=>{f.reset();$('#orden').value='';pintar()};
 f.oninput=e=>/search|number/.test(e.target.type)&&pinta();
 f.onchange=$('#orden').onchange=e=>/search|number/.test(e.target.type)||pintar();
 f.onsubmit=e=>{e.preventDefault();pinta()};
 tabs.onclick=e=>{const b=e.target.closest('button');if(!b)return;f.elements.tipo.value=b.dataset.v;pintar()};
 $('#borrar').onclick=$('#borrar2').onclick=borrar;
 $('#chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;const{k,v}=b.dataset;
  if(k==='marca')$$('[name=marca]',f).find(x=>x.value===v).checked=false;else f.elements[k].value='';pintar()};
 /* En el móvil los filtros suben desde abajo */
 const hoja=on=>{lat.classList.toggle('abierta',on);document.documentElement.classList.toggle('sin-scroll',on)};
 $('#abre-filtros').onclick=()=>hoja(true);$('#ver-res').onclick=$('#cierra-filtros').onclick=$('#velo').onclick=()=>hoja(false);
 tecla(e=>e.key==='Escape'&&hoja(false));limpia.push(()=>hoja(false));
 pinta();
}

/* ----- Ficha de coche ----- */
if($('#ficha')){
 const c=COCHES.find(x=>x.id===Q.get('id'));
 if(document.referrer.includes('coches.html?'))$('#volver').href=document.referrer;
 $('#ld-coche')?.remove();
 if(!c){$('#ficha').innerHTML='<div class="vacio"><h1>No encontramos ese coche</h1><p>Puede que ya se haya vendido.</p><a class="btn osc" href="coches.html">Ver todos los coches</a></div>';$('#miga').textContent='';}
 else{
  const N=c.fotos||1,n=nombre(c);
  document.title=`${n} · ${NEGOCIO.nombre}`;
  $('#miga').textContent=n;
  $('#ficha').innerHTML=Ficha(c);
  document.head.insertAdjacentHTML('beforeend',`<script type="application/ld+json" id="ld-coche">${JSON.stringify({'@context':'https://schema.org','@type':'Car',name:n,brand:c.marca,model:c.modelo,vehicleModelDate:String(c.anio),
   mileageFromOdometer:{'@type':'QuantitativeValue',value:c.km,unitCode:'KMT'},fuelType:c.comb,vehicleTransmission:c.cambio,image:new URL(foto(c,1),location.href).href,
   offers:{'@type':'Offer',price:c.precio,priceCurrency:'EUR',availability:'https://schema.org/InStock',seller:{'@type':'AutoDealer',name:NEGOCIO.nombre}}}).replace(/</g,'\\u003c')}<\/script>`);
  const img=$('#g-img'),vis=$('#visor'),vimg=$('#v-img');let k=0,x0=0;
  const ve=i=>{k=(i+N)%N;img.hidden=false;img.classList.remove('entra');void img.offsetWidth;img.classList.add('entra');
   img.src=foto(c,k+1);img.alt=`${n}, foto ${k+1} de ${N}`;$('#g-cont').textContent=`${k+1} / ${N}`;
   if(vis.open){vimg.src=foto(c,k+1);vimg.alt=img.alt;$('#v-cont').textContent=`${k+1} / ${N}`}
   $$('.miniatura').forEach((b,j)=>{b.setAttribute('aria-current',String(j===k));j===k&&b.scrollIntoView({block:'nearest',inline:'center'})});
   new Image().src=foto(c,(k+1)%N+1)};
  const desliza=el=>{el.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
   el.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;Math.abs(d)>50&&ve(k+(d<0?1:-1))})};
  /* Fotos a pantalla completa */
  const abre=()=>{vimg.src=foto(c,k+1);vimg.alt=img.alt;$('#v-cont').textContent=`${k+1} / ${N}`;vis.showModal()};
  $('#amplia').onclick=abre;img.onclick=abre;
  $('[data-cierra]',vis).onclick=()=>vis.close();vis.onclick=e=>e.target===vis&&vis.close();
  if(N>1){
   $$('.fl.izq').forEach(b=>b.onclick=()=>ve(k-1));$$('.fl.der').forEach(b=>b.onclick=()=>ve(k+1));
   $('#minis').onclick=e=>{const b=e.target.closest('.miniatura');b&&ve(+b.dataset.k)};
   desliza($('#grande'));desliza(vis);
   tecla(e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('#busca').open||$('#movil').open)return;e.key==='ArrowLeft'?ve(k-1):e.key==='ArrowRight'&&ve(k+1)});
   $$('.miniatura')[0].setAttribute('aria-current','true');
  }
  /* Compartir: menú del móvil o copiar el enlace */
  const co=$('#compartir');
  co.onclick=async()=>{const d={title:`${n} · ${NEGOCIO.nombre}`,text:`${n} ${c.anio}, ${eur.format(c.precio)}`,url:location.href};
   try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.url);$('span',co).textContent='Enlace copiado';setTimeout(()=>$('span',co).textContent='Compartir este coche',2200)}}catch(e){}};
  $('#parecidos').innerHTML=COCHES.filter(x=>x.id!==c.id).sort((a,b)=>Math.abs(a.precio-c.precio)-Math.abs(b.precio-c.precio)).slice(0,3).map((x,i)=>CocheCard(x,true).replace('class="coche rev"',`class="coche rev" style="--i:${i}"`)).join('');
 }
}

/* ----- Vende tu coche: el mensaje se va escribiendo a la vista y sale por WhatsApp ----- */
if($('#vende')){
 const f=$('#vende'),v=$('#vista-wa');f.elements.anio.max=new Date().getFullYear()+1;
 const msg=d=>`Hola, quiero vender mi coche.\nCoche: ${d.marca} ${d.modelo} (${d.anio})\nKilómetros: ${d.km}\nCombustible: ${d.comb}\nNombre: ${d.nombre}\nTeléfono: ${d.tel}\nComentarios: ${d.msg||'-'}`;
 const vista=()=>{const d=Object.fromEntries(new FormData(f)),h=x=>x?esc(x):'<i>…</i>';
  v.innerHTML=`Hola, quiero vender mi coche.<br><b>Coche:</b> ${h((d.marca+' '+d.modelo).trim())}${d.anio?' ('+esc(d.anio)+')':''}<br><b>Kilómetros:</b> ${h(d.km&&num.format(+d.km))}<br><b>Combustible:</b> ${esc(d.comb)}<br><b>Nombre:</b> ${h(d.nombre)}<br><b>Teléfono:</b> ${h(d.tel)}${d.msg?'<br><b>Comentarios:</b> '+esc(d.msg):''}`;
  const o=['marca','modelo','anio','km','nombre','tel'],hechos=o.filter(x=>d[x]).length;
  $('#vende-avance').style.transform=`scaleX(${hechos/o.length})`};
 f.oninput=vista;vista();
 f.onsubmit=e=>{e.preventDefault();open(wa(msg(Object.fromEntries(new FormData(f)))),'_blank','noopener')};
}

/* ----- Contacto: ¿abierto ahora? ----- */
if($('#ahora')){const t=Abierto(),on=t.startsWith('Abierto'),{d}=HoraMadrid();
 $('#ahora').innerHTML=`<i></i>${t}`;$('#ahora').classList.toggle('abierto',on);
 $$('#tabla-horario tr').forEach(r=>r.classList.toggle('hoy',(r.dataset.d==='dom')===(d==='domingo')))}

reveal();
}

marco();
CARGA.then(iniciar);
