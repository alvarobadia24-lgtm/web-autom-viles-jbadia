const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0,useGrouping:'always'});
const num=v=>v===''||v==null?NaN:Number(String(v).replace(/\D/g,''));
const miles=n=>new Intl.NumberFormat('es-ES',{useGrouping:'always'}).format(n);
const A=$('#app');
const MARCAS=['Audi','BMW','Citroën','Dacia','Fiat','Ford','Honda','Hyundai','Kia','Mazda','Mercedes','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo'];
const VACIO={marca:'',modelo:'',anio:'',km:'',comb:'',cambio:'',tipo:'',precio:'',descr:'',dgt:'',potencia:'',color:'',propietarios:'',destacado:false};
const NOMBRES=['Datos del coche','Fotos','Precio y descripción','Revisar y publicar'];
const S={coches:[],filtro:'todos',vista:'carga',paso:1,edit:null,b:{...VACIO},fotos:[],orig:0,errs:{},conf:null,msg:'',err:'',prog:0,progTxt:'',sucio:false,ultimo:null};

const api=async(url,o={})=>{
 const r=await fetch(url,{method:o.method||'GET',headers:{'X-Requested-With':'admin',...(o.json?{'Content-Type':'application/json'}:{}),...o.headers},body:o.json?JSON.stringify(o.json):o.body});
 let d=null;try{d=await r.json()}catch{}
 if(!r.ok)throw Object.assign(new Error(d?.error||'Error'),{status:r.status});
 return d};
const foto=(c,i)=>`fotos/${c.id}-${i}.jpg?v=${c.v||0}`;
const msgErr=e=>e.status===401||e.status===403?'Tu sesión ha caducado. Recarga la página para volver a entrar.':e.message==='Failed to fetch'?'No hay conexión con internet. Inténtalo de nuevo.':'Algo ha fallado ('+e.message+'). Inténtalo de nuevo.';

/* ---------- Validación ---------- */
const VAL={
 1:b=>{const e={},y=new Date().getFullYear();
  if(!b.marca.trim())e.marca='Escribe la marca. Por ejemplo: Seat';
  if(!b.modelo.trim())e.modelo='Escribe el modelo. Por ejemplo: León ST 2.0 TDI';
  const a=num(b.anio);if(!(a>=1950&&a<=y+1))e.anio=`Escribe el año con 4 cifras. Por ejemplo: ${y-5}`;
  if(!(num(b.km)>=0))e.km='Escribe los kilómetros. Por ejemplo: 85000';
  for(const k of['comb','cambio','tipo'])b[k]||(e[k]='Elige una opción');
  return e},
 2:()=>({}),
 3:b=>{const e={};
  if(!(num(b.precio)>0))e.precio='Escribe el precio. Por ejemplo: 12900';
  for(const[k,m]of[['potencia',2000],['propietarios',20]])if(b[k]!==''&&!(num(b[k])>=1&&num(b[k])<=m))e[k]='Número no válido';
  return e}};
const cuerpo=b=>({...b,anio:num(b.anio),km:num(b.km),precio:num(b.precio),potencia:b.potencia===''?null:num(b.potencia),propietarios:b.propietarios===''?null:num(b.propietarios)});

/* ---------- Piezas de formulario ---------- */
const err=n=>S.errs[n]?`<p class="err" id="e-${n}">${S.errs[n]}</p>`:'';
const attr=n=>`id="f-${n}" name="${n}" aria-invalid="${!!S.errs[n]}"${S.errs[n]?` aria-describedby="e-${n}"`:''}`;
const campo=(n,et,o={})=>`<div><label for="f-${n}">${et}</label><input ${attr(n)} type="text" value="${esc(S.b[n])}" autocomplete="off"${o.num?' inputmode="numeric"':''}${o.lista?` list="${o.lista}"`:''}${o.ph?` placeholder="${esc(o.ph)}"`:''}>${o.ayuda?`<small>${o.ayuda}</small>`:''}${err(n)}</div>`;
const sel=(n,et,ops,ayuda)=>`<div><label for="f-${n}">${et}</label><select ${attr(n)} autocomplete="off"><option value="">Elige…</option>${ops.map(([v,t])=>`<option value="${esc(v)}"${S.b[n]===v?' selected':''}>${esc(t||v)}</option>`).join('')}</select>${ayuda?`<small>${ayuda}</small>`:''}${err(n)}</div>`;

/* ---------- Vistas ---------- */
const ETIQ={disponible:'Disponible',reservado:'Reservado',vendido:'Vendido'};
const tarjeta=c=>`<li class="adm-coche">
 ${c.fotos?`<img src="${esc(foto(c,1))}" alt="" width="120" height="90" >`:'<div class="sinfoto"></div>'}
 <div><h2>${esc(c.marca+' '+c.modelo)}</h2><p class="datos">${c.anio} · ${miles(c.km)} km · ${eur.format(c.precio)}</p><span class="est ${c.estado}">${ETIQ[c.estado]}</span></div>
 ${S.conf===c.id?`<div class="conf" role="alert"><p>¿Seguro que quieres borrar el ${esc(c.marca+' '+c.modelo)}? Se borrará para siempre.</p><button class="btn peli" data-a="borrar-si" data-id="${esc(c.id)}">Sí, borrar</button><button class="btn sec" data-a="borrar-no">No, lo dejo</button></div>`
 :`<div class="adm-acc"><button class="btn osc" data-a="editar" data-id="${esc(c.id)}">Editar</button>
 ${c.estado==='disponible'?`<button class="btn sec" data-a="estado" data-e="reservado" data-id="${esc(c.id)}">Marcar reservado</button><button class="btn sec" data-a="estado" data-e="vendido" data-id="${esc(c.id)}">Marcar vendido</button>`:''}
 ${c.estado==='reservado'?`<button class="btn sec" data-a="estado" data-e="disponible" data-id="${esc(c.id)}">Quitar reserva</button><button class="btn sec" data-a="estado" data-e="vendido" data-id="${esc(c.id)}">Marcar vendido</button>`:''}
 ${c.estado==='vendido'?`<button class="btn sec" data-a="estado" data-e="disponible" data-id="${esc(c.id)}">Volver a poner a la venta</button>`:''}
 <button class="btn sec" data-a="borrar" data-id="${esc(c.id)}">Borrar</button></div>`}
</li>`;

const vLista=()=>{
 const cuenta=e=>S.coches.filter(c=>e==='todos'||c.estado===e).length;
 const l=S.coches.filter(c=>S.filtro==='todos'||c.estado===S.filtro);
 return `<h1 tabindex="-1">Mis coches</h1>
<p class="ayuda">Aquí puedes añadir coches nuevos y cambiar los que ya tienes. Los coches vendidos dejan de verse en la web.</p>
${S.err?`<p class="avisos mal" role="alert">${esc(S.err)}</p>`:''}
<button class="btn xl" data-a="nuevo">+ Añadir un coche</button>
<div class="filtros-est" role="group" aria-label="Mostrar">${[['todos','Todos'],['disponible','Disponibles'],['reservado','Reservados'],['vendido','Vendidos']].map(([e,t])=>`<button data-a="filtro" data-e="${e}" aria-pressed="${S.filtro===e}">${t} (${cuenta(e)})</button>`).join('')}</div>
${l.length?`<ul class="adm-lista">${l.map(tarjeta).join('')}</ul>`:`<div class="vacio-adm"><h2>${S.coches.length?'No hay coches en esta lista':'Todavía no hay ningún coche'}</h2><p>${S.coches.length?'Prueba con otro filtro.':'Pulsa «Añadir un coche» y te iremos guiando paso a paso.'}</p></div>`}`};

const esOtra=()=>S.otra||(S.b.marca&&!MARCAS.includes(S.b.marca));
const selMarca=()=>{const o=esOtra();return `<div><label for="f-marcaSel">Marca</label><select id="f-marcaSel" name="marcaSel" aria-invalid="${!o&&!!S.errs.marca}" autocomplete="off"><option value="">Elige…</option>${MARCAS.map(m=>`<option value="${m}"${!o&&S.b.marca===m?' selected':''}>${m}</option>`).join('')}<option value="__otra"${o?' selected':''}>Otra marca (escribirla)</option></select>${o?'':err('marca')}</div>${o?campo('marca','Escribe la marca',{ph:'Lancia'}):''}`};
const pasoDatos=()=>`<p class="ayuda">Empieza por lo básico. Lo encuentras en la ficha técnica o en el permiso de circulación.</p>
${selMarca()}
${campo('modelo','Modelo y versión',{ph:'León ST 2.0 TDI'})}
<div class="dos-c">${campo('anio','Año de matriculación',{num:1,ph:'2018'})}${campo('km','Kilómetros',{num:1,ph:'85000'})}</div>
<div class="dos-c">${sel('comb','Combustible',['Diésel','Gasolina','Híbrido','Eléctrico'].map(x=>[x]))}${sel('cambio','Cambio',[['Manual'],['Automático']])}</div>
${sel('tipo','Tipo de coche',[['Utilitario','Utilitario (pequeño, de ciudad)'],['Berlina','Berlina'],['SUV','SUV (alto, todocamino)'],['Familiar','Familiar (ranchera o monovolumen)']])}`;

const pasoFotos=()=>`<p class="ayuda">Las fotos venden el coche. La primera es la portada. Con el coche limpio y luz natural quedan mucho mejor. Puedes subir hasta 20.</p>
<div class="fotos-ac"><label class="btn xl" for="f-gal">Elegir fotos de la galería</label><input id="f-gal" type="file" accept="image/*" multiple>
<label class="btn xl sec" for="f-cam">Hacer una foto ahora</label><input id="f-cam" type="file" accept="image/*" capture="environment"></div>
${S.msg?`<p class="avisos" role="status">${esc(S.msg)}</p>`:''}
${S.fotos.length?`<ul class="fotos-grid">${S.fotos.map((f,i)=>`<li class="foto-it"><img src="${esc(f.src)}" alt="Foto ${i+1}">${i===0?'<p class="portada">Portada</p>':'<p class="portada">Foto '+(i+1)+'</p>'}<div class="mini-acc"><button type="button" data-a="mover" data-i="${i}" data-d="-1" aria-label="Mover la foto ${i+1} antes"${i===0?' disabled':''}>◀</button><button type="button" data-a="mover" data-i="${i}" data-d="1" aria-label="Mover la foto ${i+1} después"${i===S.fotos.length-1?' disabled':''}>▶</button><button type="button" data-a="quitar" data-i="${i}" aria-label="Quitar la foto ${i+1}">Quitar</button></div></li>`).join('')}</ul>`:'<p class="avisos">Todavía no has añadido fotos. Puedes seguir y añadirlas más tarde.</p>'}`;

const pasoPrecio=()=>`<p class="ayuda">Escribe el precio final y cuenta cómo está el coche: estado, revisiones, extras y cuántos dueños ha tenido.</p>
${campo('precio','Precio en euros',{num:1,ph:'12900',ayuda:'Solo el número, sin puntos ni el símbolo €.'})}
<div><label for="f-descr">Descripción</label><textarea ${attr('descr')} rows="6" placeholder="Ejemplo: Un solo dueño, revisiones al día en el concesionario, ITV recién pasada, aire acondicionado y bluetooth.">${esc(S.b.descr)}</textarea><small>Puedes dejar una línea en blanco para separar párrafos.</small></div>
<details><summary><strong>Más datos (opcional)</strong></summary><div class="form-adm" style="padding:16px 0 0;background:none">
${sel('dgt','Etiqueta ambiental de la DGT',[['0','0 (azul)'],['ECO','ECO (azul y verde)'],['C','C (verde)'],['B','B (amarilla)'],['Sin etiqueta']])}
<div class="dos-c">${campo('potencia','Potencia (CV)',{num:1,ph:'115'})}${campo('propietarios','Nº de propietarios',{num:1,ph:'1'})}</div>
${campo('color','Color',{ph:'Gris'})}</div></details>
<label class="chk"><input type="checkbox" name="destacado"${S.b.destacado?' checked':''}> Mostrar este coche en la portada de la web</label>`;

const pasoRevisar=()=>{const b=S.b,d=(t,v,c)=>v?`<div${c?` class="${c}"`:''}><dt>${t}</dt><dd>${esc(v)}</dd></div>`:'';
 return `<p class="ayuda">Mira que todo esté bien. Si algo no te convence, vuelve atrás con el botón «Atrás».</p>
${S.fotos[0]?`<img class="portada-prev" src="${esc(S.fotos[0].src)}" alt="Portada del coche">`:''}
<dl class="resumen">${d('Coche',b.marca+' '+b.modelo,'ancho')}${d('Precio',eur.format(num(b.precio)))}${d('Año',b.anio)}${d('Kilómetros',miles(num(b.km))+' km')}${d('Combustible',b.comb)}${d('Cambio',b.cambio)}${d('Tipo',b.tipo)}${d('Etiqueta DGT',b.dgt)}${d('Potencia',b.potencia&&b.potencia+' CV')}${d('Color',b.color)}${d('Propietarios',b.propietarios)}${d('Fotos',S.fotos.length+' foto'+(S.fotos.length===1?'':'s'),'')}${d('En la portada',b.destacado?'Sí':'')}${d('Descripción',b.descr,'ancho')}</dl>
${S.err?`<p class="avisos mal" role="alert">${esc(S.err)}</p>`:''}`};

const vAsistente=()=>{const p=S.paso,f=[pasoDatos,pasoFotos,pasoPrecio,pasoRevisar][p-1];
 return `<p class="paso-info">Paso ${p} de 4</p><ol class="pasos-barra" aria-hidden="true">${[1,2,3,4].map(i=>`<li${i<=p?' class="on"':''}></li>`).join('')}</ol>
<h1 tabindex="-1">${S.edit?'Editar: ':''}${NOMBRES[p-1]}</h1>
<form id="f" class="form-adm" novalidate>${f()}</form>
<div class="nav-pasos"><button class="btn xl sec" data-a="${p===1?'cancelar':'atras'}">${p===1?'Cancelar':'Atrás'}</button><button class="btn xl" data-a="${p===4?'publicar':'sig'}">${p===4?(S.edit?'Guardar cambios':'Publicar el coche'):'Siguiente'}</button></div>`};

const vGuardando=()=>`<h1 tabindex="-1">Guardando…</h1><p class="ayuda">No cierres esta página hasta que termine.</p><div class="progreso" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${S.prog}"><span style="width:${S.prog}%"></span></div><p class="ayuda" style="margin-top:12px" role="status">${esc(S.progTxt)}</p>`;
const vListo=()=>`<div class="ok-grande"><h1 tabindex="-1">¡Listo!</h1><p class="ayuda">El coche ya está guardado. Puede tardar un minuto en verse en la web.</p><div class="botones"><a class="btn xl" href="coche.html?id=${encodeURIComponent(S.ultimo)}" target="_blank" rel="noopener">Ver el coche en la web</a><button class="btn xl sec" data-a="nuevo">Añadir otro coche</button><button class="btn xl sec" data-a="lista">Volver a mis coches</button></div></div>`;
const vCarga=()=>`<h1 tabindex="-1">Cargando…</h1>`;
const vError=()=>`<h1 tabindex="-1">No se ha podido cargar</h1><p class="avisos mal" role="alert">${esc(S.err)}</p><div class="botones"><button class="btn xl" data-a="reintentar">Reintentar</button></div>`;

const VISTAS={carga:vCarga,lista:vLista,asistente:vAsistente,guardando:vGuardando,listo:vListo,error:vError};
const render=foco=>{A.innerHTML=VISTAS[S.vista]();foco&&A.querySelector('h1')?.focus();window.onbeforeunload=S.vista==='asistente'&&S.sucio?e=>e.preventDefault():null};

/* ---------- Datos ---------- */
const cargar=async()=>{try{S.coches=await api('/api/admin/coches');S.vista='lista';S.err=''}catch(e){S.err=msgErr(e);S.vista=S.coches.length?'lista':'error'}render(true)};
const nuevo=()=>{S.otra=false;S.edit=null;S.b={...VACIO};S.fotos=[];S.orig=0;S.paso=1;S.errs={};S.err='';S.msg='';S.sucio=false;S.vista='asistente';render(true)};
const editar=id=>{const c=S.coches.find(x=>x.id===id);if(!c)return;S.otra=false;
 S.edit=id;S.b={...VACIO,marca:c.marca,modelo:c.modelo,anio:String(c.anio),km:String(c.km),comb:c.comb,cambio:c.cambio,tipo:c.tipo,precio:String(c.precio),descr:c.desc||'',dgt:c.dgt||'',potencia:c.potencia?String(c.potencia):'',color:c.color||'',propietarios:c.propietarios?String(c.propietarios):'',destacado:!!c.destacado};
 S.fotos=Array.from({length:c.fotos},(_,i)=>({pos:i+1,src:foto(c,i+1)}));S.orig=c.fotos;S.paso=1;S.errs={};S.err='';S.msg='';S.sucio=false;S.vista='asistente';render(true)};
const cambiarEstado=async(id,estado)=>{try{await api(`/api/admin/coches/${id}/estado`,{method:'PUT',json:{estado}});S.err=''}catch(e){S.err=msgErr(e)}await cargar()};
const borrar=async id=>{try{await api(`/api/admin/coches/${id}`,{method:'DELETE'});S.err=''}catch(e){S.err=msgErr(e)}S.conf=null;await cargar()};

const reducir=async file=>{
 const bmp=await createImageBitmap(file,{imageOrientation:'from-image'});
 const k=Math.min(1,1600/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');
 cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
 for(const[t,qs]of[['image/webp',[.82,.7,.55]],['image/jpeg',[.8,.65,.5]]])for(const q of qs){
  const b=await new Promise(r=>cv.toBlob(r,t,q));if(b&&b.type===t&&b.size<1.4e6)return b}
 throw new Error('foto demasiado grande')};
const añadirFotos=async files=>{
 const l=[...files];let n=0,mal=0;
 for(const f of l){if(S.fotos.length>=20){S.msg='Ya tienes 20 fotos, que es el máximo.';break}
  S.msg=`Preparando foto ${++n} de ${l.length}…`;render();
  try{const b=await reducir(f);S.fotos.push({blob:b,src:URL.createObjectURL(b)});S.sucio=true}catch{mal++}}
 S.msg=mal?`${mal} foto${mal>1?'s':''} no se ${mal>1?'han':'ha'} podido usar. Prueba con otra.`:'';render()};

const guardar=async()=>{
 for(const p of[1,3]){const e=VAL[p](S.b);if(Object.keys(e).length){S.paso=p;S.errs=e;S.err='';render(true);return}}
 S.vista='guardando';S.prog=5;S.progTxt='Guardando los datos…';render(true);
 try{
  const car=S.edit?await api(`/api/admin/coches/${S.edit}`,{method:'PUT',json:cuerpo(S.b)}):await api('/api/admin/coches',{method:'POST',json:cuerpo(S.b)});
  S.edit=car.id;
  const nuevas=S.fotos.filter(f=>!f.pos);let h=0;
  for(const f of nuevas){S.progTxt=`Subiendo foto ${++h} de ${nuevas.length}…`;S.prog=10+Math.round(80*(h-1)/nuevas.length);render();
   f.pos=(await api(`/api/admin/coches/${car.id}/fotos`,{method:'POST',body:f.blob,headers:{'Content-Type':f.blob.type}})).pos}
  if(S.fotos.length||S.orig){S.progTxt='Ordenando las fotos…';S.prog=95;render();
   await api(`/api/admin/coches/${car.id}/fotos/orden`,{method:'PUT',json:{orden:S.fotos.map(f=>f.pos)}})}
  S.ultimo=car.id;S.sucio=false;S.coches=await api('/api/admin/coches');S.vista='listo';render(true)
 }catch(e){S.err=msgErr(e)+(S.edit?' El coche ya se ha guardado: pulsa de nuevo «Guardar cambios» para terminar de subir las fotos que faltan.':'');S.vista='asistente';S.paso=4;render(true)}};

/* ---------- Eventos ---------- */
A.addEventListener('input',e=>{const t=e.target,n=t.name;if(!n||!(n in S.b))return;S.b[n]=t.type==='checkbox'?t.checked:t.value;S.sucio=true;if(S.errs[n]){delete S.errs[n];$(`#e-${n}`)?.remove();t.removeAttribute('aria-invalid')}});
A.addEventListener('change',e=>{const t=e.target;
 if(t.type==='file'&&t.files.length){añadirFotos(t.files);t.value=''}
 else if(t.name==='marcaSel'){const o=t.value==='__otra';S.otra=o;S.b.marca=o?'':t.value;S.sucio=true;delete S.errs.marca;render();$(o?'#f-marca':'#f-marcaSel',A)?.focus()}});
A.addEventListener('submit',e=>{e.preventDefault();$('[data-a=sig],[data-a=publicar]',A)?.click()});
A.addEventListener('click',e=>{
 const b=e.target.closest('[data-a]');if(!b)return;const{a,id,i,d}=b.dataset;
 if(a==='nuevo')nuevo();
 else if(a==='lista'){S.vista='lista';render(true)}
 else if(a==='reintentar'){S.vista='carga';render();cargar()}
 else if(a==='editar')editar(id);
 else if(a==='filtro'){S.filtro=b.dataset.e;render()}
 else if(a==='estado')cambiarEstado(id,b.dataset.e);
 else if(a==='borrar'){S.conf=id;render()}
 else if(a==='borrar-no'){S.conf=null;render()}
 else if(a==='borrar-si')borrar(id);
 else if(a==='cancelar'){if(!S.sucio||confirm('¿Salir sin guardar? Se perderá lo que has escrito.')){S.sucio=false;S.vista='lista';render(true)}}
 else if(a==='atras'){S.paso--;S.errs={};S.err='';render(true)}
 else if(a==='sig'){const er=VAL[S.paso](S.b);S.errs=er;if(Object.keys(er).length){render();A.querySelector('[aria-invalid=true]')?.focus()}else{S.paso++;S.err='';render(true)}}
 else if(a==='publicar')guardar();
 else if(a==='mover'){const x=+i,y=x+ +d;[S.fotos[x],S.fotos[y]]=[S.fotos[y],S.fotos[x]];S.sucio=true;render()}
 else if(a==='quitar'){S.fotos.splice(+i,1);S.sucio=true;render()}});

cargar();
