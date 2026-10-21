const NEGOCIO={
 nombre:'AutosJBS',titular:'Juan Antonio Badia Sivianes',tel:'34605976375',telTxt:'605 97 63 75',mail:'jbadia@autosjbs.es',
 dir:'Calle Picasso, 1 · Bollullos de la Mitación',horario:'Lunes a sábado · 9:00–14:00 y 17:00–21:00'};

const DEMO='Descripción de ejemplo: estado del coche, revisiones, extras y número de propietarios.\nPuedes escribir varios párrafos separándolos con un salto de línea.';

const EJEMPLO=[
{id:'coche1',marca:'Audi',modelo:'A4',anio:2021,km:45000,comb:'Diésel',cambio:'Automático',tipo:'Berlina',precio:32900,fotos:6,desc:DEMO},
{id:'coche2',marca:'BMW',modelo:'X3',anio:2020,km:62000,comb:'Diésel',cambio:'Automático',tipo:'SUV',precio:29500,fotos:6,desc:DEMO},
{id:'coche3',marca:'Mercedes',modelo:'Clase A',anio:2019,km:71000,comb:'Gasolina',cambio:'Automático',tipo:'Berlina',precio:22900,fotos:6,desc:DEMO},
{id:'coche4',marca:'Volkswagen',modelo:'Golf',anio:2018,km:95000,comb:'Diésel',cambio:'Manual',tipo:'Utilitario',precio:13900,fotos:6,desc:DEMO},
{id:'coche5',marca:'Seat',modelo:'León ST',anio:2017,km:110000,comb:'Diésel',cambio:'Manual',tipo:'Familiar',precio:10900,fotos:6,desc:DEMO},
{id:'coche6',marca:'Peugeot',modelo:'3008',anio:2018,km:98000,comb:'Diésel',cambio:'Manual',tipo:'SUV',precio:15900,fotos:6,desc:DEMO},
{id:'coche7',marca:'Renault',modelo:'Clio',anio:2016,km:88000,comb:'Gasolina',cambio:'Manual',tipo:'Utilitario',precio:8900,fotos:6,desc:DEMO},
{id:'coche8',marca:'Toyota',modelo:'Yaris',anio:2019,km:52000,comb:'Híbrido',cambio:'Automático',tipo:'Utilitario',precio:14900,fotos:6,desc:DEMO},
{id:'coche9',marca:'Ford',modelo:'Focus',anio:2014,km:140000,comb:'Diésel',cambio:'Manual',tipo:'Berlina',precio:6500,fotos:6,desc:DEMO},
{id:'coche10',marca:'Opel',modelo:'Corsa',anio:2012,km:150000,comb:'Gasolina',cambio:'Manual',tipo:'Utilitario',precio:3900,fotos:6,desc:DEMO},
{id:'coche11',marca:'Citroën',modelo:'C3',anio:2013,km:125000,comb:'Diésel',cambio:'Manual',tipo:'Utilitario',precio:4800,fotos:6,desc:DEMO},
{id:'coche12',marca:'Skoda',modelo:'Octavia Combi',anio:2016,km:130000,comb:'Diésel',cambio:'Manual',tipo:'Familiar',precio:11500,fotos:6,desc:DEMO}
];

/* Los coches reales vienen del servidor (/api/coches) y se gestionan desde /admin.
   EJEMPLO solo se usa al probar en tu ordenador sin servidor (Live Server o doble clic). */
let COCHES=[],ERROR_CARGA=false;
const CARGA=fetch('/api/coches').then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{COCHES=d})
 .catch(()=>{/^(localhost|127\.0\.0\.1)?$/.test(location.hostname)?COCHES=EJEMPLO.map(c=>({estado:'disponible',destacado:0,v:0,...c})):ERROR_CARGA=true});