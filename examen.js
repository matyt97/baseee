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
