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

/* En qué página estamos y cómo se leen o escriben los filtros de la dirección */
const RUTA=window.RUTA||{
 get pag(){return location.pathname.split('/').pop().replace('.html','')||'index'},
 get q(){return new URLSearchParams(location.search)},
 pon(u){history.replaceState(null,'',u?'?'+u:location.pathname)},
 foto:(c,i)=>`fotos/${c.id}-${i}.jpg?v=${c.v||0}`
};
const foto=(c,i)=>RUTA.foto(c,i);
const wa=t=>`https://wa.me/${NEGOCIO.tel}?text=${encodeURIComponent(t)}`;
const fichaUrl=c=>'coche.html?id='+encodeURIComponent(c.id);
const nombre=c=>`${c.marca} ${c.modelo}`;
const consulta=c=>wa(`Hola, me interesa el ${nombre(c)} ${c.anio} de ${eur.format(c.precio)}`);
const QUIETO=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Iconos (dibujados aquí para no cargar nada de fuera) */
const I=(d,x='')=>`<svg class="ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${x}>${d}</svg>`;
const ICO={
 lupa:I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>'),
 tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 flecha:I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
 izq:I('<path d="m15 5-7 7 7 7"/>'),der:I('<path d="m9 5 7 7-7 7"/>'),
 cerrar:I('<path d="M6 6l12 12M18 6 6 18"/>'),
 menu:I('<path d="M4 8h16M4 16h16"/>'),
 ampliar:I('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
 compartir:I('<path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
 filtros:I('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
 pin:I('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21Z"/><circle cx="12" cy="9.500" r="2.500"/>'),
 mail:I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'),
 wa:'<svg class="ico" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2Zm0 1.800a8.200 8.200 0 1 1-4.200 15.300l-.300-.200-2.900.800.800-2.800-.200-.300A8.200 8.200 0 0 1 12 3.800Zm-3.300 3.700c-.200 0-.500.100-.700.400-.300.300-1 1-1 2.300s1 2.700 1.100 2.900c.200.200 2 3.100 4.900 4.300 2.400.900 2.900.800 3.400.700.500 0 1.700-.700 1.900-1.300.200-.700.200-1.200.200-1.300l-.500-.300-1.800-.900c-.200-.100-.400-.100-.600.100l-.800 1c-.100.200-.300.200-.500.100-.300-.100-1.100-.400-2.100-1.300-.800-.700-1.300-1.500-1.400-1.800-.200-.200 0-.400.100-.500l.400-.500.300-.400v-.500l-.800-2c-.200-.500-.400-.500-.600-.500h-.500Z"/></svg>'
};

/* Abierto / cerrado según el horario (hora de Madrid) */
const HoraMadrid=(f=new Date())=>{
 const p=Object.fromEntries(new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(f).map(x=>[x.type,x.value]));
 return{m:+p.hour*60+ +p.minute,d:p.weekday.toLowerCase()}};
const Abierto=(f=new Date())=>{
 const{m,d}=HoraMadrid(f);
 if(d==='domingo')return 'Hoy cerrado · abrimos el lunes a las 9:00';
 if(m>=540&&m<840)return 'Abierto ahora · cerramos a las 14:00';
 if(m>=1020&&m<1260)return 'Abierto ahora · cerramos a las 21:00';
 if(m<540)return 'Cerrado ahora · abrimos a las 9:00';
 if(m<1020)return 'Cerrado ahora · abrimos a las 17:00';
 return d==='sábado'?'Cerrado ahora · abrimos el lunes a las 9:00':'Cerrado ahora · abrimos mañana a las 9:00';
};

/* Componentes: cada uno devuelve HTML */
const Marca=()=>`<a class="marca" href="index.html" translate="no" aria-label="${NEGOCIO.nombre}, inicio"><img src="logo-icono.png" alt="" width="44" height="44"><span>Autos<b>JBS</b></span></a>`;

const Header=()=>{
 const P=RUTA.pag,a=([k,x])=>`<a href="${k}.html"${k===P||(k==='coches'&&P==='coche')?' aria-current="page"':''}>${x}</a>`;
 return `<a class="salto" href="#main">Saltar al contenido</a>
<div class="progreso" aria-hidden="true"><i id="progreso"></i></div>
<header class="cab" id="cabecera"><div class="wrap cab-fila">
${Marca()}
<nav class="menu" aria-label="Principal">${PAGS.map(a).join('')}</nav>
<button class="redondo" type="button" id="abre-busca" aria-label="Buscar un coche">${ICO.lupa}</button>
<a class="btn oro cab-tel" href="tel:+${NEGOCIO.tel}">${ICO.tel}<span>${NEGOCIO.telTxt}</span></a>
<button class="redondo hamb" type="button" id="abre-menu" aria-label="Abrir el menú">${ICO.menu}</button>
</div></header>
<dialog class="movil" id="movil" aria-label="Menú">
<div class="movil-cab">${Marca()}<button class="redondo" type="button" data-cierra aria-label="Cerrar el menú">${ICO.cerrar}</button></div>
<nav aria-label="Principal, móvil">${PAGS.map((p,i)=>a(p).replace('<a ',`<a style="--i:${i}" `)).join('')}</nav>
<div class="movil-pie"><a class="btn oro" href="tel:+${NEGOCIO.tel}">${ICO.tel}Llamar al ${NEGOCIO.telTxt}</a><a class="btn linea" href="${wa('Hola, quería información')}" target="_blank" rel="noopener">${ICO.wa}WhatsApp</a><p>${NEGOCIO.horario}</p></div>
</dialog>
<dialog class="busca" id="busca" aria-label="Buscar un coche">
<form method="dialog" class="busca-caja"><label class="sr" for="q-busca">Marca o modelo</label>${ICO.lupa}
<input id="q-busca" type="search" placeholder="Marca o modelo…" autocomplete="off" spellcheck="false" enterkeyhint="search">
<button class="redondo" type="submit" aria-label="Cerrar el buscador">${ICO.cerrar}</button></form>
<div class="busca-res" id="busca-res" aria-live="polite"></div>
</dialog>`};

const Footer=()=>`<footer class="pie oscuro"><div class="wrap">
<div class="pie-arriba"><p class="pie-frase">¿Buscas coche o quieres vender el tuyo?</p>
<div class="pie-btns"><a class="btn oro" href="coches.html">Ver los coches</a><a class="btn linea" href="${wa('Hola, quería información')}" target="_blank" rel="noopener">${ICO.wa}Escribir por WhatsApp</a></div></div>
<div class="pie-grid">
<div>${Marca()}<p>Compraventa de coches de ocasión en Bollullos de la Mitación, con más de 20 años de experiencia.</p></div>
<div><h2>Páginas</h2>${PAGS.map(([k,x])=>`<a href="${k}.html">${x}</a>`).join('')}</div>
<div><h2>Contacto</h2><p>${NEGOCIO.dir}</p><a href="tel:+${NEGOCIO.tel}">${NEGOCIO.telTxt}</a><a href="mailto:${NEGOCIO.mail}">${NEGOCIO.mail}</a><p>${NEGOCIO.horario}</p></div>
</div>
<p class="gran" aria-hidden="true" translate="no">${NEGOCIO.nombre}</p>
<p class="pie-legal"><span>© ${new Date().getFullYear()} ${NEGOCIO.nombre}</span><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad y cookies</a></p>
</div></footer>`;

/* Foto con recambio: si la foto no carga se ve la marca del coche sobre fondo azul */
const Foto=(c,i,x='')=>`<img src="${foto(c,i)}" alt="" ${x} onerror="this.remove()">`;
const Etqs=c=>{const g=gamaDe(c.precio);return `<span class="etq ${g}">${GAMAS[g]}</span>${c.estado==='reservado'?'<span class="etq res">Reservado</span>':''}`};

const CocheCard=(c,anim)=>{
 const n=nombre(c);
 return `<article class="coche${anim?' rev':''}" data-id="${esc(c.id)}">
<div class="foto" data-m="${esc(c.marca)}">${Foto(c,1,'width="640" height="480" loading="lazy"')}<div class="etqs">${Etqs(c)}</div></div>
<div class="coche-info"><h3><a class="enlace" href="${fichaUrl(c)}">${esc(n)}</a></h3>
<ul class="datos"><li>${c.anio}</li><li>${num.format(c.km)} km</li><li>${esc(c.comb)}</li><li>${esc(c.cambio)}</li></ul>
<div class="fila"><strong class="precio">${eur.format(c.precio)}</strong><a class="redondo wa-c" href="${consulta(c)}" target="_blank" rel="noopener" aria-label="Preguntar por WhatsApp por el ${esc(n)}">${ICO.wa}</a></div></div></article>`};

const Chip=(k,v,txt)=>`<button class="chip" type="button" data-k="${k}" data-v="${esc(v)}">${esc(txt)} <span aria-hidden="true">×</span><span class="sr">Quitar filtro</span></button>`;

const Filtros=()=>{
 const u=k=>[...new Set(COCHES.map(c=>c[k]))],o=(a,t)=>a.map(v=>`<option value="${esc(v)}">${esc(t?t(v):v)}</option>`).join('');
 const marcas=u('marca').sort((a,b)=>a.localeCompare(b,'es'));
 const sel=(id,et,v)=>`<div><label for="${id}">${et}</label><select id="${id}" name="${id.replace('f-','')}" autocomplete="off">${v}</select></div>`;
 return `<div><label for="f-q">Buscar</label><input id="f-q" name="q" type="search" placeholder="Marca o modelo…" autocomplete="off" spellcheck="false"></div>
<fieldset><legend>Marca</legend><div class="marcas">${marcas.map(m=>`<label><input type="checkbox" name="marca" value="${esc(m)}"><span>${esc(m)}</span><small>${COCHES.filter(c=>c.marca===m).length}</small></label>`).join('')}</div></fieldset>
${sel('f-tipo','Tipo','<option value="">Todos</option>'+o(TIPOS,v=>TIPOS_ETQ[v]))}
${sel('f-gama','Gama','<option value="">Todas</option>'+o(Object.keys(GAMAS),v=>GAMAS[v]))}
${sel('f-comb','Combustible','<option value="">Todos</option>'+o(u('comb')))}
${sel('f-cambio','Cambio','<option value="">Todos</option>'+o(u('cambio')))}
<fieldset><legend>Precio</legend><div class="par"><input name="pmin" type="number" inputmode="numeric" min="0" step="500" placeholder="Mín.…" aria-label="Precio mínimo en euros" autocomplete="off"><input name="pmax" type="number" inputmode="numeric" min="0" step="500" placeholder="Máx.…" aria-label="Precio máximo en euros" autocomplete="off"></div></fieldset>
${sel('f-anio','Año desde','<option value="">Cualquiera</option>'+o(u('anio').sort((a,b)=>b-a)))}
${sel('f-km','Kilómetros hasta','<option value="">Cualquiera</option>'+o([50000,100000,150000],v=>num.format(v)+' km'))}
<div class="filtros-pie"><button class="btn linea-osc" type="button" id="borrar">Borrar filtros</button><button class="btn osc solo-movil" type="button" id="ver-res">Ver coches</button></div>`};

const Ficha=c=>{
 const n=nombre(c),N=c.fotos||1;
 const minis=Array.from({length:N},(_,i)=>`<button class="miniatura" type="button" data-k="${i}" aria-label="Ver foto ${i+1}">${Foto(c,i+1,'width="120" height="90" loading="lazy"')}</button>`).join('');
 const dato=(t,v)=>v||v===0?`<div><dt>${t}</dt><dd>${esc(v)}</dd></div>`:'';
 return `<div class="col-izq"><div class="galeria" role="group" aria-roledescription="carrusel" aria-label="Fotos de ${esc(n)}">
<div class="grande" id="grande" data-m="${esc(c.marca)}"><img id="g-img" src="${foto(c,1)}" alt="${esc(n)}, foto 1 de ${N}" width="960" height="720" fetchpriority="high" onerror="this.hidden=true">
<div class="etqs">${Etqs(c)}</div>
${N>1?`<button class="redondo fl izq" type="button" aria-label="Foto anterior">${ICO.izq}</button><button class="redondo fl der" type="button" aria-label="Foto siguiente">${ICO.der}</button>`:''}
<button class="redondo amplia" type="button" id="amplia" aria-label="Ver las fotos a pantalla completa">${ICO.ampliar}</button>
<p class="cont" id="g-cont" aria-live="polite">1 / ${N}</p></div>
${N>1?`<div class="minis" id="minis">${minis}</div>`:''}</div>
${c.desc?`<section class="descr"><h2>Descripción</h2>${c.desc.split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}</section>`:''}</div>
<aside class="panel">${c.estado==='reservado'?'<p class="aviso-res"><strong>Reservado.</strong> Pregúntanos si sigue disponible.</p>':''}
<p class="panel-marca">${esc(c.marca)}</p><h1>${esc(c.modelo)}</h1>
<p class="panel-res">${c.anio} · ${num.format(c.km)} km · ${esc(c.comb)}</p>
<strong class="precio" id="precio-f">${eur.format(c.precio)}</strong>
<div class="acciones"><a class="btn oro" href="${consulta(c)}" target="_blank" rel="noopener">${ICO.wa}Preguntar por WhatsApp</a><a class="btn linea-osc" href="tel:+${NEGOCIO.tel}">${ICO.tel}Llamar al ${NEGOCIO.telTxt}</a>
<button class="btn texto-btn" type="button" id="compartir">${ICO.compartir}<span>Compartir este coche</span></button></div>
<dl class="specs">${dato('Año',c.anio)}${dato('Kilómetros',num.format(c.km)+' km')}${dato('Combustible',c.comb)}${dato('Cambio',c.cambio)}${dato('Tipo',c.tipo)}${dato('Etiqueta DGT',c.dgt)}${dato('Potencia',c.potencia&&c.potencia+' CV')}${dato('Color',c.color)}${dato('Propietarios',c.propietarios)}</dl>
<p class="nota">Seguro de garantía de 12 meses. Las condiciones dependen de la antigüedad y el estado del coche.</p></aside>
<div class="barra-movil" id="barra-movil"><div><small>${esc(n)}</small><strong>${eur.format(c.precio)}</strong></div><a class="redondo" href="tel:+${NEGOCIO.tel}" aria-label="Llamar">${ICO.tel}</a><a class="btn oro" href="${consulta(c)}" target="_blank" rel="noopener">${ICO.wa}WhatsApp</a></div>
<dialog class="visor" id="visor" aria-label="Fotos de ${esc(n)} a pantalla completa"><button class="redondo cierra" type="button" data-cierra aria-label="Cerrar">${ICO.cerrar}</button>
<img id="v-img" alt="">${N>1?`<button class="redondo fl izq" type="button" aria-label="Foto anterior">${ICO.izq}</button><button class="redondo fl der" type="button" aria-label="Foto siguiente">${ICO.der}</button>`:''}<p class="cont" id="v-cont"></p></dialog>`};
