/* ============================================================
   ALMACENAMIENTO (tolerante a fallos)
   ============================================================ */
const mem = {};
const NS = 'bd-ucen:';

async function save(k, v){
  const raw = JSON.stringify(v);
  try{
    if (window.storage) { await window.storage.set(NS + k, raw); return; }
    localStorage.setItem(NS + k, raw);
  }catch(e){ mem[k] = v; }
}

async function load(k, def){
  try{
    if (window.storage){
      const r = await window.storage.get(NS + k);
      return r ? JSON.parse(r.value) : (k in mem ? mem[k] : def);
    }
    const raw = localStorage.getItem(NS + k);
    return raw !== null ? JSON.parse(raw) : (k in mem ? mem[k] : def);
  }catch(e){ return (k in mem) ? mem[k] : def; }
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
const tabs=[...document.querySelectorAll('.tab')];
tabs.forEach(t=>t.addEventListener('click',()=>{
  tabs.forEach(x=>x.setAttribute('aria-selected', x===t));
  document.querySelectorAll('.panel').forEach(p=>p.hidden = (p.id!==t.dataset.p));
  window.scrollTo({top:0,behavior:'smooth'});
}));
document.querySelectorAll('.panel').forEach((p,i)=>p.hidden = i!==0);

/* ============================================================
   ESQUEMA
   ============================================================ */
const schemaEl=document.getElementById('schema');
Object.entries(TABLAS).forEach(([nom,d])=>{
  const b=document.createElement('button');
  b.className='ent'; b.setAttribute('aria-pressed','false');
  b.innerHTML=`<span class="nm">${nom}</span><span class="pk">${d.pk.join(' + ')}</span><span class="cnt">${d.cols.length} columnas · ${d.fk.length} FK</span>`;
  b.addEventListener('click',()=>{
    document.querySelectorAll('.ent').forEach(e=>e.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    pintarDetalle(nom,d);
  });
  schemaEl.appendChild(b);
});
function pintarDetalle(nom,d){
  const cols=d.cols.map(c=>{
    let cls='col';
    if(d.pk.includes(c)) cls+=' is-pk';
    else if(d.fk.includes(c)) cls+=' is-fk';
    return `<span class="${cls}">${c}</span>`;
  }).join('');
  document.getElementById('entDetail').innerHTML=
    `<h4>${nom}</h4>
     <div class="cols">${cols}</div>
     <p style="margin:0 0 12px;color:#C3D2E0;font-size:14.5px">${d.desc}</p>
     <ul class="rels">${d.rel.map(r=>`<li class="mono" style="font-size:12.5px">${r}</li>`).join('')}</ul>`;
}
document.getElementById('verReconstruccion').addEventListener('click',()=>{
  const k=document.getElementById('reconKey');
  k.hidden=false;
  k.innerHTML=`<b>Respuesta</b><br>
  REGIONS → (sin FK)<br>
  COUNTRIES → region_id<br>
  LOCATIONS → country_id<br>
  DEPARTMENTS → manager_id, location_id<br>
  JOBS → (sin FK)<br>
  EMPLOYEES → job_id, manager_id (reflexiva), department_id<br>
  JOB_HISTORY → employee_id, job_id, department_id · PK compuesta (employee_id + start_date)`;
});
document.getElementById('limpiarRecon').addEventListener('click',()=>{
  document.getElementById('reconstruir').value='';
  document.getElementById('reconKey').hidden=true;
});
document.getElementById('reconstruir').addEventListener('input',e=>save('recon',e.target.value));
load('recon','').then(v=>{ if(v) document.getElementById('reconstruir').value=v; });

/* ============================================================
   FLASHCARDS
   ============================================================ */
let mazo=[], idx=0, falladas=[], vueltas=0;
const fcQ=document.getElementById('fcQ'), fcA=document.getElementById('fcA'),
      fcTag=document.getElementById('fcTag'), fcCtrl=document.getElementById('fcControls'),
      fcCount=document.getElementById('fcCounter');

function armarMazo(){
  const tema=document.getElementById('fcTema').value;
  mazo = FLASHCARDS.filter(c=>tema==='all'||c.t===tema);
  mazo = mazo.map(c=>c).sort(()=>Math.random()-.5);
  idx=0; falladas=[]; vueltas=0;
  mostrar();
}
function mostrar(){
  if(idx>=mazo.length){
    if(falladas.length){
      mazo=falladas.slice().sort(()=>Math.random()-.5); falladas=[]; idx=0; vueltas++;
      fcTag.textContent='Repaso de falladas';
    }else{
      fcTag.textContent='Listo';
      fcQ.textContent='Mazo terminado. Respondiste bien todas las tarjetas.';
      fcA.hidden=true;
      fcCtrl.innerHTML='<button class="btn" id="fcReset">Empezar de nuevo</button>';
      document.getElementById('fcReset').addEventListener('click',armarMazo);
      fcCount.textContent='';
      return;
    }
  }
  const c=mazo[idx];
  fcTag.textContent=c.t;
  fcQ.textContent=c.q;
  fcA.textContent=c.a; fcA.hidden=true;
  fcCtrl.innerHTML='<button class="btn" id="fcFlip">Mostrar respuesta</button>';
  document.getElementById('fcFlip').addEventListener('click',voltear);
  fcCount.textContent=`${idx+1} de ${mazo.length}${vueltas?' · repaso '+vueltas:''}${falladas.length?' · '+falladas.length+' por repetir':''}`;
}
function voltear(){
  fcA.hidden=false;
  fcCtrl.innerHTML='<button class="btn bad" id="fcNo">No la sabía</button><button class="btn good" id="fcSi">La sabía</button>';
  document.getElementById('fcNo').addEventListener('click',()=>{falladas.push(mazo[idx]);idx++;mostrar();});
  document.getElementById('fcSi').addEventListener('click',()=>{idx++;mostrar();});
}
document.getElementById('fcTema').addEventListener('change',armarMazo);
armarMazo();

/* ============================================================
   SQL
   ============================================================ */
const sqlList=document.getElementById('sqlList');
SQL_EJ.forEach((ej,i)=>{
  const d=document.createElement('div');
  d.className='card';
  d.innerHTML=`
    <p class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--rule);margin:0 0 8px">${String(i+1).padStart(2,'0')} · ${ej.n}</p>
    <p style="margin:0 0 12px;font-size:15.5px">${ej.e}</p>
    <div class="field"><textarea id="sqlIn${i}" placeholder="SELECT ..."></textarea></div>
    <div class="btn-row">
      <button class="btn ghost" data-sol="${i}">Ver solución</button>
    </div>
    <div id="sqlSol${i}" hidden>
      <pre class="sql">${ej.s.replace(/</g,'&lt;')}</pre>
      <div class="hintbox">${ej.h}</div>
    </div>`;
  sqlList.appendChild(d);
});
sqlList.addEventListener('click',e=>{
  const b=e.target.closest('[data-sol]'); if(!b) return;
  const box=document.getElementById('sqlSol'+b.dataset.sol);
  box.hidden=!box.hidden;
  b.textContent=box.hidden?'Ver solución':'Ocultar solución';
});
SQL_EJ.forEach((_,i)=>{
  const ta=document.getElementById('sqlIn'+i);
  ta.addEventListener('input',()=>save('sql'+i,ta.value));
  load('sql'+i,'').then(v=>{if(v) ta.value=v;});
});

/* ============================================================
   PENSAR
   ============================================================ */
const thinkList=document.getElementById('thinkList');
THINK.forEach(t=>{
  const d=document.createElement('details');
  d.className='think';
  d.innerHTML=`<summary>${t.q}</summary><div class="body">${t.a}</div>`;
  thinkList.appendChild(d);
});

/* ============================================================
   FEYNMAN
   ============================================================ */
const fySel=document.getElementById('fyTema');
FEYNMAN.forEach((f,i)=>{
  const o=document.createElement('option'); o.value=i; o.textContent=f.k; fySel.appendChild(o);
});
function fyRender(){
  const f=FEYNMAN[fySel.value];
  document.getElementById('fyPrompt').textContent=f.p;
  document.getElementById('fyKey').hidden=true;
  document.getElementById('fyEstado').textContent='';
  load('fy'+fySel.value,'').then(v=>document.getElementById('fyTexto').value=v||'');
}
fySel.addEventListener('change',fyRender);
document.getElementById('fyGuardar').addEventListener('click',async()=>{
  await save('fy'+fySel.value, document.getElementById('fyTexto').value);
  document.getElementById('fyEstado').textContent='Explicación guardada.';
});
document.getElementById('fyPista').addEventListener('click',()=>{
  const f=FEYNMAN[fySel.value], k=document.getElementById('fyKey');
  k.hidden=false;
  k.innerHTML='<b>Deberías haber mencionado</b><ul style="margin:8px 0 0;padding-left:18px">'+f.pts.map(p=>`<li>${p}</li>`).join('')+'</ul>';
});
fyRender();

/* ============================================================
   GENERADOR DE PRUEBAS
   ============================================================ */
let temporizador=null, restante=0, pausado=false, actual=[];

function tomar(arr,n){ return arr.slice().sort(()=>Math.random()-.5).slice(0,n); }

document.getElementById('exGen').addEventListener('click',()=>{
  const tipo=document.getElementById('exTipo').value;
  const n=Math.max(4,Math.min(14,parseInt(document.getElementById('exN').value)||8));
  const min=Math.max(10,Math.min(120,parseInt(document.getElementById('exMin').value)||45));

  if(tipo==='mix'){
    const base=Math.ceil(n/3);
    actual=[...tomar(BANCO['1'],base),...tomar(BANCO['2'],base),...tomar(BANCO['3'],base)]
      .sort(()=>Math.random()-.5).slice(0,n)
      .map(q=>({...q,src:'mix'}));
  }else{
    actual=tomar(BANCO[tipo],n).map(q=>({...q,src:tipo}));
  }

  const total=actual.reduce((a,b)=>a+b.p,0);
  const titulos={'1':'Prueba 1 — Modelo relacional','2':'Prueba 2 — SQL','3':'Prueba 3 — SQL avanzado','mix':'Examen final'};
  document.getElementById('exBody').innerHTML=
    `<p class="mono" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--rule);margin:0">${titulos[tipo]} · ${min} min · ${total} puntos</p>
     <h3 style="margin:6px 0 4px">Responde en hoja aparte o en cada campo. Sin apuntes.</h3>`
    + actual.map((q,i)=>`
      <div class="exam-q">
        <div class="qhead">
          <span class="qnum">${String(i+1).padStart(2,'0')}</span>
          <span class="qtext">${q.q}</span>
          <span class="qpts">${q.p} pts</span>
        </div>
        <div class="field no-print"><textarea id="exR${i}" placeholder="Tu respuesta…"></textarea></div>
        <div class="key no-print" id="exK${i}" hidden><b>Pauta</b><br>${q.k.replace(/</g,'&lt;')}</div>
        <div class="selfmark no-print" id="exM${i}" hidden>
          <span>Autoevaluación</span>
          <button class="mk y" data-q="${i}" data-v="1" aria-pressed="false">Correcta</button>
          <button class="mk h" data-q="${i}" data-v="0.5" aria-pressed="false">A medias</button>
          <button class="mk n" data-q="${i}" data-v="0" aria-pressed="false">Incorrecta</button>
        </div>
      </div>`).join('');

  document.getElementById('exWrap').hidden=false;
  document.getElementById('exResult').hidden=true;
  restante=min*60; pausado=false;
  document.getElementById('exPause').textContent='Pausar';
  clearInterval(temporizador);
  pintarTiempo();
  temporizador=setInterval(()=>{
    if(pausado) return;
    restante--; pintarTiempo();
    if(restante<=0){ clearInterval(temporizador); corregir(); }
  },1000);
  document.getElementById('exWrap').scrollIntoView({behavior:'smooth'});
});

function pintarTiempo(){
  const m=Math.floor(Math.max(0,restante)/60), s=Math.max(0,restante)%60;
  const el=document.getElementById('exTimer');
  el.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.style.color = restante<300 ? 'var(--alert)' : 'var(--manila)';
}
document.getElementById('exPause').addEventListener('click',e=>{
  pausado=!pausado; e.target.textContent=pausado?'Continuar':'Pausar';
});
document.getElementById('exFinish').addEventListener('click',corregir);

function corregir(){
  clearInterval(temporizador);
  actual.forEach((_,i)=>{
    document.getElementById('exK'+i).hidden=false;
    document.getElementById('exM'+i).hidden=false;
  });
  document.getElementById('exResult').hidden=false;
  document.getElementById('exVerdict').textContent='Compara cada respuesta con su pauta y márcate honestamente. Marcar de más solo te engaña a ti.';
  document.getElementById('exResult').scrollIntoView({behavior:'smooth'});
}

document.getElementById('exBody').addEventListener('click',e=>{
  const b=e.target.closest('.mk'); if(!b) return;
  const q=b.dataset.q;
  document.querySelectorAll(`.mk[data-q="${q}"]`).forEach(x=>x.setAttribute('aria-pressed','false'));
  b.setAttribute('aria-pressed','true');
  calcular();
});

function calcular(){
  let obt=0, tot=0; const flojos=[];
  actual.forEach((q,i)=>{
    tot+=q.p;
    const m=document.querySelector(`.mk[data-q="${i}"][aria-pressed="true"]`);
    if(m){
      const v=parseFloat(m.dataset.v);
      obt+=q.p*v;
      if(v<1) flojos.push(i+1);
    }
  });
  const pct=tot?Math.round(obt/tot*100):0;
  const nota=(1+ (obt/tot||0)*6).toFixed(1);
  document.getElementById('exScore').textContent=`${Math.round(obt)}/${tot} pts · nota ${nota}`;
  document.getElementById('exBar').style.width=pct+'%';
  document.getElementById('exBar').style.background = pct>=60?'var(--ok)':(pct>=40?'var(--manila)':'var(--alert)');
  let v;
  if(pct>=80) v='Dominas la materia. Mantén el repaso espaciado y no dejes de simular pruebas.';
  else if(pct>=60) v='Apruebas, pero con margen justo. Vuelve a las preguntas que fallaste antes de estudiar cualquier cosa nueva.';
  else if(pct>=40) v='Reprobando. Identifica los dos temas más flojos y trabájalos con tarjetas y ejercicios antes de simular otra prueba.';
  else v='Muy abajo. Vuelve a la teoría de esos temas desde cero: aquí no falta práctica, falta base.';
  document.getElementById('exVerdict').textContent=v;
  document.getElementById('exWeak').textContent = flojos.length ? `Preguntas a repasar: ${flojos.join(', ')}.` : '';
}

document.getElementById('exPrint').addEventListener('click',()=>window.print());
