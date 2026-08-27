(()=>{
 const read=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
 const norm=s=>String(s||'').trim().toLowerCase();
 const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const style=`<style id="aito-diag-style">
 .aito-diag{margin:12px 0;padding:14px 16px;border:1px solid #d9e1eb;border-radius:12px;background:#f8fafc;color:#172033}.aito-diag h3{margin:0 0 8px;font-size:14px}.aito-diag-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.aito-diag-item{padding:9px 10px;border-radius:9px;background:#fff;border:1px solid #e2e8f0;font-size:12px}.aito-diag-item b{display:block;margin-bottom:3px}.aito-ok b{color:#137333}.aito-warn b{color:#9a6700}.aito-block b{color:#b42318}.aito-diag ul{margin:8px 0 0;padding-left:18px}.aito-diag a{font-weight:800;color:#1f5f99;text-decoration:none}
 </style>`;
 const ensureStyle=()=>{if(!document.getElementById('aito-diag-style'))document.head.insertAdjacentHTML('beforeend',style)};
 async function state(){
  const store=read('aito-store',{}),all=store.functions||[],active=all.filter(f=>f?.name&&(+f.people||0)>0),draft=all.filter(f=>(+f.people||0)<=0),ins=store.employeeInsights||[];
  let inv=[];try{const r=await fetch('/api/survey-link');const j=await r.json();inv=(j.items||[]).filter(x=>x.form_code==='F03')}catch{}
  const rows=active.map(f=>{const assigned=inv.filter(i=>norm(i.function_name)===norm(f.name)),done=assigned.filter(i=>i.submitted_at),fin=ins.filter(i=>norm(i.functionName)===norm(f.name)),responses=Math.max(done.length,fin.length),expected=+f.people||0,pct=expected?clamp(responses/expected*100):0;return{...f,responses,expected,pct,missing:Math.max(0,expected-responses)}});
  const missingOwners=active.filter(f=>!String(f.owner||'').trim());
  const noResponses=rows.filter(r=>r.responses===0);
  const lowCoverage=rows.filter(r=>r.responses>0&&r.pct<70);
  const offBaselineInv=inv.filter(i=>!active.some(f=>norm(f.name)===norm(i.function_name)));
  const duplicateKeys=new Map();for(const i of inv){const k=[norm(i.recipient_email),norm(i.function_name),norm(i.recipient_role)].join('|');duplicateKeys.set(k,(duplicateKeys.get(k)||0)+1)}
  const duplicateInv=[...duplicateKeys.entries()].filter(([k,n])=>k.replaceAll('|','')&&n>1);
  const headcountConflict=rows.filter(r=>r.responses>r.expected);
  return{store,active,draft,inv,rows,missingOwners,noResponses,lowCoverage,offBaselineInv,duplicateInv,headcountConflict};
 }
 function listNames(a,max=4){const n=a.map(x=>x.name||x.function_name||x.recipient_name).filter(Boolean);return n.slice(0,max).join(', ')+(n.length>max?` +${n.length-max}`:'')}
 async function enhanceJourney(){
  if(location.pathname!=='/journey')return;ensureStyle();const s=await state(),box=document.querySelector('.next-action');if(!box)return;
  const h=box.querySelector('h2'),a=box.querySelector('a');let text='',href='';
  if(!s.active.length){text=s.draft.length?`Definisci l’organico per almeno una funzione. Fuori baseline: ${listNames(s.draft)}.`:'Inserisci almeno una funzione aziendale e definiscine l’organico.';href='/?tab=functions'}
  else if(s.missingOwners.length){text=`Assegna l’owner a ${listNames(s.missingOwners)}.`;href='/?tab=functions'}
  else if(s.offBaselineInv.length){text=`Correggi ${s.offBaselineInv.length} inviti F03 associati a funzioni fuori baseline.`;href='/survey-campaign'}
  else if(!s.inv.length){text=`Prepara la campagna F03 per ${s.active.length} funzioni attive (${s.active.reduce((n,f)=>n+(+f.people||0),0)} persone).`;href='/survey-campaign'}
  else if(s.noResponses.length){text=`Avvia/raccogli F03 per ${listNames(s.noResponses)}: non risultano ancora risposte.`;href='/survey-campaign'}
  else if(s.lowCoverage.length){const r=[...s.lowCoverage].sort((x,y)=>x.pct-y.pct)[0];text=`Aumenta la coverage di ${r.name}: ${r.pct}% (${r.responses}/${r.expected}), mancano ${r.missing} persone.`;href='/survey-coverage'}
  if(text&&h){h.textContent=text;if(a){a.setAttribute('href',href);a.textContent=(href.includes('functions')?'Apri Funzioni':href.includes('campaign')?'Apri Campaign Manager':'Apri Assessment Confidence')+' →'}}
  let diag=document.getElementById('aito-journey-diagnostics');if(diag)diag.remove();diag=document.createElement('section');diag.id='aito-journey-diagnostics';diag.className='aito-diag';
  const issues=[];if(s.missingOwners.length)issues.push(`Owner mancanti: ${listNames(s.missingOwners,8)}`);if(s.draft.length)issues.push(`Fuori baseline (organico 0): ${listNames(s.draft,8)}`);if(s.offBaselineInv.length)issues.push(`${s.offBaselineInv.length} inviti F03 fuori baseline`);if(s.duplicateInv.length)issues.push(`${s.duplicateInv.length} possibili duplicazioni F03`);if(s.headcountConflict.length)issues.push(`Risposte > organico dichiarato: ${listNames(s.headcountConflict,8)}`);
  diag.innerHTML=`<h3>Diagnostica operativa</h3><div class="aito-diag-grid"><div class="aito-diag-item ${s.active.length?'aito-ok':'aito-block'}"><b>${s.active.length?'OK':'BLOCKER'} · Baseline</b>${s.active.length} funzioni attive · ${s.draft.length} fuori baseline</div><div class="aito-diag-item ${s.missingOwners.length?'aito-block':'aito-ok'}"><b>${s.missingOwners.length?'BLOCKER':'OK'} · Owner</b>${s.missingOwners.length?esc(listNames(s.missingOwners,5)):'Tutte le funzioni attive hanno un owner'}</div><div class="aito-diag-item ${s.offBaselineInv.length||s.duplicateInv.length?'aito-warn':'aito-ok'}"><b>${s.offBaselineInv.length||s.duplicateInv.length?'WARNING':'OK'} · F03</b>${s.inv.length} inviti · ${s.offBaselineInv.length} fuori baseline · ${s.duplicateInv.length} duplicati</div></div>${issues.length?`<ul>${issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;
  box.insertAdjacentElement('afterend',diag);
 }
 async function enhanceReadiness(){
  if(location.pathname!=='/v1-readiness')return;ensureStyle();const s=await state(),main=document.querySelector('main');if(!main)return;document.getElementById('aito-v1-diagnostics')?.remove();
  const checks=[
   {name:'Baseline organizzativa',level:s.active.length?'OK':'BLOCKER',msg:s.active.length?`${s.active.length} funzioni attive`:'Nessuna funzione con organico > 0'},
   {name:'Owner funzioni attive',level:s.missingOwners.length?'BLOCKER':'OK',msg:s.missingOwners.length?`${s.missingOwners.length} mancanti: ${listNames(s.missingOwners,4)}`:'Completi'},
   {name:'Coerenza inviti F03',level:s.offBaselineInv.length?'BLOCKER':s.duplicateInv.length?'WARNING':'OK',msg:`${s.offBaselineInv.length} fuori baseline · ${s.duplicateInv.length} duplicati`},
   {name:'Coerenza organico/risposte',level:s.headcountConflict.length?'WARNING':'OK',msg:s.headcountConflict.length?listNames(s.headcountConflict,4):'Nessuna anomalia rilevata'},
   {name:'Copertura discovery',level:s.inv.length&&s.rows.some(r=>r.responses>0)?'OK':'WARNING',msg:`${s.rows.reduce((n,r)=>n+r.responses,0)} risposte rilevate su ${s.active.reduce((n,f)=>n+(+f.people||0),0)} persone baseline`}
  ];
  const blockers=checks.filter(c=>c.level==='BLOCKER').length,warnings=checks.filter(c=>c.level==='WARNING').length,status=blockers?'NON PRONTA':warnings?'PRONTA CON WARNING':'PRONTA';
  const sec=document.createElement('section');sec.id='aito-v1-diagnostics';sec.className='aito-diag';sec.innerHTML=`<h3>V1 Operational Readiness · ${status}</h3><p><b>${blockers} blocker · ${warnings} warning</b>. Questo controllo usa i dati operativi reali del workspace.</p><div class="aito-diag-grid">${checks.map(c=>`<div class="aito-diag-item ${c.level==='OK'?'aito-ok':c.level==='WARNING'?'aito-warn':'aito-block'}"><b>${c.level} · ${esc(c.name)}</b>${esc(c.msg)}</div>`).join('')}</div>${blockers?'<p><a href="/?tab=functions">Correggi prima la baseline organizzativa →</a></p>':''}`;
  main.insertBefore(sec,main.children[1]||null);
 }
 const run=()=>{enhanceJourney();enhanceReadiness()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,400));else setTimeout(run,400);
 window.addEventListener('storage',()=>setTimeout(run,100));
 setTimeout(run,1600);
})();
