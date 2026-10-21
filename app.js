document.head.insertAdjacentHTML('beforeend','<link rel="icon" href="favicon.png" type="image/png">');
$('#cab').innerHTML=Header();$('#pie').innerHTML=Footer();
document.body.insertAdjacentHTML('beforeend',`<a class="wa-f" href="${wa('Hola, quería información')}" target="_blank" rel="noopener">WhatsApp</a>`);
CARGA.then(()=>{
ERROR_CARGA&&$('#main').insertAdjacentHTML('afterbegin','<p class="wrap aviso-carga" role="alert">Ahora mismo no podemos cargar los coches. Inténtalo de nuevo en unos minutos o llámanos al '+NEGOCIO.telTxt+'.</p>');
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const cuantos=l=>`${l} ${l===1?'coche':'coches'}`;
const opts=(a,t)=>a.map(v=>`<option value="${esc(v)}">${esc(t?t(v):v)}</option>`).join('');
const uniq=k=>[...new Set(COCHES.map(c=>c[k]))].sort((a,b)=>String(a).localeCompare(String(b),'es'));
const aplica=(c,s)=>(!s.q||norm(c.marca+' '+c.modelo).includes(norm(s.q)))&&(!s.marca||!s.marca.length||s.marca.includes(c.marca))
 &&(!s.tipo||c.tipo===s.tipo)&&(!s.gama||gamaDe(c.precio)===s.gama)&&(!s.comb||c.comb===s.comb)&&(!s.cambio||c.cambio===s.cambio)
 &&(!s.pmin||c.precio>=+s.pmin)&&(!s.pmax||c.precio<=+s.pmax)&&(!s.anio||c.anio>=+s.anio)&&(!s.km||c.km<=+s.km);
const ORDEN={'precio-asc':(a,b)=>a.precio-b.precio,'precio-desc':(a,b)=>b.precio-a.precio,'anio-desc':(a,b)=>b.anio-a.anio,'km-asc':(a,b)=>a.km-b.km};

/* Entrada suave: solo transform y opacity */
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&(e.target.classList.add('vis'),io.unobserve(e.target))),{threshold:.12});
const reveal=()=>$$('.rev:not(.vis)').forEach(e=>io.observe(e));

/* Inicio */
if($('#rapida')){
 const f=$('#rapida');
 $('#h-marca').insertAdjacentHTML('beforeend',opts(uniq('marca')));
 $('#h-pmax').insertAdjacentHTML('beforeend',opts([5000,10000,15000,20000,30000],v=>'Hasta '+eur.format(v)));
 $('#h-comb').insertAdjacentHTML('beforeend',opts(uniq('comb')));
 const total=()=>{const d=Object.fromEntries(new FormData(f));
  $('#h-ver').textContent='Ver '+cuantos(COCHES.filter(c=>aplica(c,{marca:d.marca?[d.marca]:[],pmax:d.pmax,comb:d.comb})).length)};
 f.onchange=total;total();
 $$('[data-gama]').forEach(a=>{const l=COCHES.filter(c=>gamaDe(c.precio)===a.dataset.gama);
  $('.desde',a).textContent=l.length?'Desde '+eur.format(Math.min(...l.map(c=>c.precio))):'Consúltanos';$('.n',a).textContent=cuantos(l.length)});
 const dest=(COCHES.some(c=>c.destacado)?COCHES.filter(c=>c.destacado):['alta','media','eco'].flatMap(g=>COCHES.filter(c=>gamaDe(c.precio)===g).slice(0,2))).slice(0,6);
 $('#destacados').innerHTML=!dest.length?'<p>Pronto añadiremos coches. Llámanos o escríbenos y te contamos qué tenemos.</p>':dest.map((c,i)=>CocheCard(c,true).replace('class="coche rev"',`class="coche rev" style="--i:${i%3}"`)).join('');
 $('#todos').textContent=`Ver los ${COCHES.length} coches`;
}

/* Catálogo */
if($('#filtros')){
 const f=$('#filtros'),u0=new URLSearchParams(location.search);
 f.innerHTML=Filtros();
 for(const k of ['q','tipo','gama','comb','cambio','pmin','pmax','anio','km','orden'])if(f.elements[k])f.elements[k].value=u0.get(k)||'';
 $$('[name=marca]',f).forEach(x=>x.checked=u0.getAll('marca').includes(x.value));
 if(matchMedia('(min-width:961px)').matches)$('#det').open=true;
 const estado=()=>{const d=new FormData(f);return{...Object.fromEntries(d),marca:d.getAll('marca')}};
 const ETQ={q:v=>`“${v}”`,tipo:v=>TIPOS_ETQ[v]||v,gama:v=>GAMAS[v],pmin:v=>'Desde '+eur.format(v),pmax:v=>'Hasta '+eur.format(v),anio:v=>'Desde '+v,km:v=>'Hasta '+num.format(v)+' km'};
 const pintar=()=>{
  const s=estado(),l=COCHES.filter(c=>aplica(c,s));
  if(ORDEN[s.orden])l.sort(ORDEN[s.orden]);
  $('#lista').innerHTML=l.map(c=>CocheCard(c)).join('');
  $('#vacio').hidden=l.length>0;
  $('#cuenta').textContent=cuantos(l.length);
  $('#chips').innerHTML=Object.entries(s).filter(([k])=>k!=='orden').flatMap(([k,v])=>[].concat(v).filter(Boolean).map(x=>Chip(k,x,ETQ[k]?ETQ[k](x):x))).join('');
  const u=new URLSearchParams();Object.entries(s).forEach(([k,v])=>[].concat(v).forEach(x=>x&&u.append(k,x)));
  history.replaceState(null,'',u.toString()?'?'+u:location.pathname)};
 const borrar=()=>{f.reset();$('#orden').value='';pintar()};
 f.oninput=f.onchange=$('#orden').onchange=pintar;
 f.onsubmit=e=>{e.preventDefault();pintar()};
 $('#borrar').onclick=$('#borrar2').onclick=borrar;
 $('#chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;const{k,v}=b.dataset;
  if(k==='marca')$$('[name=marca]',f).find(x=>x.value===v).checked=false;else f.elements[k].value='';pintar()};
 pintar();
}

/* Ficha de coche */
if($('#ficha')){
 const c=COCHES.find(x=>x.id===new URLSearchParams(location.search).get('id'));
 if(document.referrer.includes('coches.html'))$('#volver').href=document.referrer;
 if(!c)$('#ficha').innerHTML='<div class="vacio" style="grid-column:1/-1"><h1 style="font-size:2rem">No encontramos ese coche</h1><p>Puede que ya se haya vendido.</p><a class="btn osc" href="coches.html">Ver todos los coches</a></div>';
 else{
  document.title=`${c.marca} ${c.modelo} · ${NEGOCIO.nombre}`;
  $('#ficha').innerHTML=Ficha(c);
  const N=c.fotos||1,n=`${c.marca} ${c.modelo}`,img=$('#g-img');let k=0,x0=0;
  const ir=i=>{k=(i+N)%N;img.hidden=false;img.src=foto(c,k+1);img.alt=`${n}, foto ${k+1} de ${N}`;$('#g-cont').textContent=`${k+1} / ${N}`;
   $$('.miniatura').forEach((b,j)=>{b.setAttribute('aria-current',String(j===k));j===k&&b.scrollIntoView({block:'nearest',inline:'center'})});
   new Image().src=foto(c,(k+1)%N+1)};
  if(N>1){
   $('.izq').onclick=()=>ir(k-1);$('.der').onclick=()=>ir(k+1);
   $('#minis').onclick=e=>{const b=e.target.closest('.miniatura');b&&ir(+b.dataset.k)};
   $('#grande').addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
   $('#grande').addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x0;Math.abs(d)>50&&ir(k+(d<0?1:-1))});
   document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;e.key==='ArrowLeft'?ir(k-1):e.key==='ArrowRight'&&ir(k+1)});
   $$('.miniatura')[0].setAttribute('aria-current','true');
  }
  $('#parecidos').innerHTML=COCHES.filter(x=>x.id!==c.id).sort((a,b)=>Math.abs(a.precio-c.precio)-Math.abs(b.precio-c.precio)).slice(0,3).map(x=>CocheCard(x)).join('');
 }
}

/* Vende tu coche: abre WhatsApp con los datos ya escritos */
if($('#vende')){
 const f=$('#vende');f.elements.anio.max=new Date().getFullYear()+1;
 f.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));
  open(wa(`Hola, quiero vender mi coche.\nCoche: ${d.marca} ${d.modelo} (${d.anio})\nKilómetros: ${d.km}\nCombustible: ${d.comb}\nNombre: ${d.nombre}\nTeléfono: ${d.tel}\nComentarios: ${d.msg||'-'}`),'_blank','noopener')};
}

/* Contacto: ¿abierto ahora? */
if($('#ahora'))$('#ahora').textContent=Abierto();

reveal();
});