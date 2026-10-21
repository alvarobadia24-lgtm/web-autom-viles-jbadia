/* Utilidades */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0,useGrouping:'always'});
const num=new Intl.NumberFormat('es-ES',{useGrouping:'always'});
const gamaDe=p=>p>=20000?'alta':p>=8000?'media':'eco';
const GAMAS={alta:'Gama alta',media:'Gama media',eco:'Económico'};
const TIPOS=['Utilitario','Berlina','SUV','Familiar'];
const TIPOS_ETQ={Utilitario:'Utilitarios',Berlina:'Berlinas',SUV:'SUV',Familiar:'Familiares'};
const PAGS=[['index','Inicio'],['coches','Coches'],['vende','Vende tu coche'],['nosotros','Nosotros'],['contacto','Contacto']];
const PAG=location.pathname.split('/').pop().replace('.html','')||'index';
const foto=(c,i)=>`fotos/${c.id}-${i}.jpg?v=${c.v||0}`;
const wa=t=>`https://wa.me/${NEGOCIO.tel}?text=${encodeURIComponent(t)}`;

/* Abierto / cerrado según el horario (hora de Madrid) */
const Abierto=(f=new Date())=>{
 const p=Object.fromEntries(new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(f).map(x=>[x.type,x.value]));
 const m=+p.hour*60+ +p.minute,d=p.weekday.toLowerCase();
 if(d==='domingo')return 'Hoy cerrado · abrimos el lunes a las 9:00';
 if(m>=540&&m<840)return 'Abierto ahora · cerramos a las 14:00';
 if(m>=1020&&m<1260)return 'Abierto ahora · cerramos a las 21:00';
 if(m<540)return 'Cerrado ahora · abrimos a las 9:00';
 if(m<1020)return 'Cerrado ahora · abrimos a las 17:00';
 return d==='sábado'?'Cerrado ahora · abrimos el lunes a las 9:00':'Cerrado ahora · abrimos mañana a las 9:00';
};

/* Componentes: cada uno devuelve HTML */
const Header=()=>{
 const t=new URLSearchParams(location.search).get('tipo');
 const a=(h,txt,on)=>`<a href="${h}"${on?' aria-current="page"':''}>${txt}</a>`;
 const cats=['index','coches','coche'].includes(PAG)?`<nav class="wrap cats" aria-label="Tipos de coche">${a('coches.html','Todos',PAG==='coches'&&!t)}${TIPOS.map(x=>a('coches.html?tipo='+encodeURIComponent(x),TIPOS_ETQ[x],t===x)).join('')}</nav>`:'';
 return `<a class="salto" href="#main">Saltar al contenido</a>
<header class="cab"><div class="wrap cab-fila">
<a class="marca" href="index.html" translate="no"><img src="logo-icono.png" alt="" width="40" height="40">${NEGOCIO.nombre}</a>
<nav class="menu" aria-label="Principal">${PAGS.map(([k,x])=>a(k+'.html',x,k===PAG||(k==='coches'&&PAG==='coche'))).join('')}</nav>
<form class="busca" role="search" action="coches.html">
<label class="sr" for="q-cab">Buscar coche</label>
<input id="q-cab" name="q" type="search" placeholder="Marca o modelo…" autocomplete="off" spellcheck="false">
<button class="btn osc" type="submit">Buscar</button></form>
<a class="btn" href="tel:+${NEGOCIO.tel}">Llamar</a></div>${cats}</header>`};

const Footer=()=>`<footer class="pie oscuro"><div class="wrap">
<div class="pie-grid">
<div><h2>${NEGOCIO.nombre}</h2><p>Compraventa de coches de ocasión en Bollullos de la Mitación, con más de 20 años de experiencia.</p></div>
<div><h2>Páginas</h2>${PAGS.map(([k,x])=>`<a href="${k}.html">${x}</a>`).join('')}</div>
<div><h2>Contacto</h2><p>${NEGOCIO.dir}</p><a href="tel:+${NEGOCIO.tel}">${NEGOCIO.telTxt}</a><a href="mailto:${NEGOCIO.mail}">${NEGOCIO.mail}</a><p>${NEGOCIO.horario}</p></div>
</div><p class="pie-legal"><span>© ${new Date().getFullYear()} ${NEGOCIO.nombre}</span><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad y cookies</a></p><p class="gran" aria-hidden="true" translate="no">${NEGOCIO.nombre}</p></div></footer>`;

const CocheCard=(c,anim)=>{
 const g=gamaDe(c.precio),n=`${c.marca} ${c.modelo}`;
 return `<article class="coche${anim?' rev':''}"><div class="foto"><img src="${foto(c,1)}" alt="" width="640" height="480" loading="lazy" onerror="this.hidden=true"><span class="etq ${g}">${GAMAS[g]}</span>${c.estado==='reservado'?'<span class="etq res">Reservado</span>':''}</div>
<div class="coche-info"><h3><a class="enlace" href="coche.html?id=${encodeURIComponent(c.id)}">${esc(n)}</a></h3><p class="datos">${c.anio} · ${num.format(c.km)} km · ${esc(c.comb)} · ${esc(c.cambio)}</p>
<div class="fila"><strong class="precio">${eur.format(c.precio)}</strong><a class="btn mini" href="${wa(`Hola, me interesa el ${n} ${c.anio} de ${eur.format(c.precio)}`)}" target="_blank" rel="noopener">Consultar<span class="sr"> ${esc(n)}</span></a></div></div></article>`};

const Chip=(k,v,txt)=>`<button class="chip" type="button" data-k="${k}" data-v="${esc(v)}">${esc(txt)} <span aria-hidden="true">×</span><span class="sr">Quitar filtro</span></button>`;

const Filtros=()=>{
 const u=k=>[...new Set(COCHES.map(c=>c[k]))],o=(a,t)=>a.map(v=>`<option value="${esc(v)}">${esc(t?t(v):v)}</option>`).join('');
 const marcas=u('marca').sort((a,b)=>a.localeCompare(b,'es'));
 const sel=(id,et,v)=>`<div><label for="${id}">${et}</label><select id="${id}" name="${id.replace('f-','')}" autocomplete="off">${v}</select></div>`;
 return `<div><label for="f-q">Buscar</label><input id="f-q" name="q" type="search" placeholder="Marca o modelo…" autocomplete="off" spellcheck="false"></div>
<fieldset><legend>Marca</legend><div class="marcas">${marcas.map(m=>`<label><input type="checkbox" name="marca" value="${esc(m)}">${esc(m)}<small>${COCHES.filter(c=>c.marca===m).length}</small></label>`).join('')}</div></fieldset>
${sel('f-tipo','Tipo','<option value="">Todos</option>'+o(TIPOS,v=>TIPOS_ETQ[v]))}
${sel('f-gama','Gama','<option value="">Todas</option>'+o(Object.keys(GAMAS),v=>GAMAS[v]))}
${sel('f-comb','Combustible','<option value="">Todos</option>'+o(u('comb')))}
${sel('f-cambio','Cambio','<option value="">Todos</option>'+o(u('cambio')))}
<fieldset><legend>Precio</legend><div class="par"><input name="pmin" type="number" inputmode="numeric" min="0" step="500" placeholder="Mín.…" aria-label="Precio mínimo en euros" autocomplete="off"><input name="pmax" type="number" inputmode="numeric" min="0" step="500" placeholder="Máx.…" aria-label="Precio máximo en euros" autocomplete="off"></div></fieldset>
${sel('f-anio','Año desde','<option value="">Cualquiera</option>'+o(u('anio').sort((a,b)=>b-a)))}
${sel('f-km','Kilómetros hasta','<option value="">Cualquiera</option>'+o([50000,100000,150000],v=>num.format(v)+' km'))}
<button class="btn sec" type="button" id="borrar">Borrar filtros</button>`};

const Ficha=c=>{
 const g=gamaDe(c.precio),n=`${c.marca} ${c.modelo}`,N=c.fotos||1;
 const minis=Array.from({length:N},(_,i)=>`<button class="miniatura" type="button" data-k="${i}" aria-label="Ver foto ${i+1}"><img src="${foto(c,i+1)}" alt="" width="120" height="90" loading="lazy" onerror="this.hidden=true"></button>`).join('');
 const dato=(t,v)=>v||v===0?`<div><dt>${t}</dt><dd>${esc(v)}</dd></div>`:'';
 return `<div class="col-izq"><div class="galeria" role="group" aria-roledescription="carrusel" aria-label="Fotos de ${esc(n)}">
<div class="grande" id="grande"><img id="g-img" src="${foto(c,1)}" alt="${esc(n)}, foto 1 de ${N}" width="960" height="720" fetchpriority="high" onerror="this.hidden=true">
${N>1?`<button class="fl izq" type="button" aria-label="Foto anterior"><span aria-hidden="true">‹</span></button><button class="fl der" type="button" aria-label="Foto siguiente"><span aria-hidden="true">›</span></button>`:''}
<p class="cont" id="g-cont" aria-live="polite">1 / ${N}</p></div>
${N>1?`<div class="minis" id="minis">${minis}</div>`:''}</div>
${c.desc?`<section class="descr"><h2>Descripción</h2>${c.desc.split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}</section>`:''}</div>
<aside class="panel"><span class="etq ${g}" style="position:static;align-self:start">${GAMAS[g]}</span>${c.estado==='reservado'?'<p class="aviso-res"><strong>Reservado.</strong> Pregúntanos si sigue disponible.</p>':''}
<h1>${esc(n)}</h1><strong class="precio">${eur.format(c.precio)}</strong>
<dl class="specs">${dato('Año',c.anio)}${dato('Kilómetros',num.format(c.km)+' km')}${dato('Combustible',c.comb)}${dato('Cambio',c.cambio)}${dato('Tipo',c.tipo)}${dato('Etiqueta DGT',c.dgt)}${dato('Potencia',c.potencia&&c.potencia+' CV')}${dato('Color',c.color)}${dato('Propietarios',c.propietarios)}</dl>
<div class="acciones"><a class="btn" href="${wa(`Hola, me interesa el ${n} ${c.anio} de ${eur.format(c.precio)}`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a><a class="btn sec" href="tel:+${NEGOCIO.tel}">Llamar al ${NEGOCIO.telTxt}</a></div>
<p class="nota">Seguro de garantía de 12 meses. Las condiciones dependen de la antigüedad y el estado del coche.</p></aside>`};