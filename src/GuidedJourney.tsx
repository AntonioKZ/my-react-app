import {useEffect,useMemo,useRef,useState} from 'react'
import './guided-journey.css'

const read=(k:string,f:any)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}}
const write=(k:string,v:any)=>localStorage.setItem(k,JSON.stringify(v))
const today=()=>new Date().toISOString().slice(0,10)
const daysTo=(d:string)=>Math.ceil((new Date(d+'T12:00:00').getTime()-new Date(today()+'T12:00:00').getTime())/86400000)
const norm=(s:any)=>String(s||'').trim().toLowerCase()
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)))
const txt=(x:any)=>String(x||'').toLowerCase()

type Invite={form_code:string;submitted_at:string|null;function_name?:string;recipient_role?:string;active?:boolean}
type Meta={start?:string;target?:string;notes?:string;checks?:boolean[]}
type Step={key:string;phase:string;title:string;href:string;action:string;checks:string[];evidence:boolean[]}

const defs=[['Ricerca informazioni',['cerca','ricerca','trovare','reperire','document','informaz']],['Copia dati',['copia','reinser','trascr','excel']],['Attese',['attesa','approv','autorizz','risposta','firma']],['Report manuali',['report','relazione','verbale','rendicont']],['Email',['email','mail','outlook']],['Errori',['errore','correz','rilavor']],['Duplicazioni',['duplic','ripet','stesso dato']]] as [string,string[]][]
const themes=(i:any)=>{const s=txt([i.oneChange,i.unaskedIdea,i.hardToFind,i.duplicate,i.errorArea,i.knowledgeRisk,i.manualReport,i.workWeek,i.responsibilities].join(' '));return defs.filter(([,ks])=>ks.some(k=>s.includes(k))).map(([n])=>n)}

export default function GuidedJourney(){
 const [data]=useState<any>(()=>read('aito-store',{}))
 const [inv,setInv]=useState<Invite[]>([])
 const [meta,setMeta]=useState<Record<string,Meta>>(()=>read('aito-journey-meta',{}))
 const [cloud,setCloud]=useState('Caricamento storico...')
 const loaded=useRef(false),timer=useRef<any>(null)
 useEffect(()=>{fetch('/api/survey-link').then(r=>r.json()).then(j=>setInv(j.items||[])).catch(()=>{});fetch('/api/journey-state').then(r=>r.json()).then(j=>{if(j.ok&&j.payload&&Object.keys(j.payload).length){setMeta(j.payload);write('aito-journey-meta',j.payload);setCloud('Storico cloud sincronizzato')}else setCloud('Storico cloud pronto')}).catch(()=>setCloud('Cloud non raggiungibile · uso copia locale')).finally(()=>{loaded.current=true})},[])
 useEffect(()=>()=>clearTimeout(timer.current),[])
 const persist=(n:Record<string,Meta>)=>{write('aito-journey-meta',n);if(!loaded.current)return;clearTimeout(timer.current);timer.current=setTimeout(async()=>{setCloud('Salvataggio...');try{const r=await fetch('/api/journey-state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload:n})});if(!r.ok)throw new Error();setCloud('✓ Salvato su cloud')}catch{setCloud('⚠ Salvato solo localmente')}},500)}
 const save=(key:string,patch:Meta)=>setMeta(m=>{const n={...m,[key]:{...(m[key]||{}),...patch}};persist(n);return n})

 const j=useMemo(()=>{
  const company=data.company||{},funcs=data.functions||[],ins=data.employeeInsights||[],tasks=data.tasks||[],opps=data.opportunities||[],useCases=data.useCases||[],docs=data.documents||[],milestones=data.milestones||[],governance=read('aito-governance',[])
  const f03=inv.filter(i=>i.form_code==='F03'),doneInv=f03.filter(i=>i.submitted_at),pending=f03.filter(i=>!i.submitted_at)
  const rows=funcs.map((f:any)=>{const assigned=f03.filter(i=>norm(i.function_name)===norm(f.name)),done=assigned.filter(i=>i.submitted_at),fin=ins.filter((i:any)=>norm(i.functionName)===norm(f.name)),responses=Math.max(fin.length,done.length),expected=Math.max(0,+f.people||0),coverage=expected?clamp(responses/expected*100):0,roles=[...new Set(assigned.map(i=>i.recipient_role).filter(Boolean))],doneRoles=[...new Set(done.map(i=>i.recipient_role).filter(Boolean))],rolePct=roles.length?clamp(doneRoles.length/roles.length*100):(responses?50:0),q=fin.map((i:any)=>+i.qualityScore||0).filter((v:number)=>v>0),quality=q.length?clamp(q.reduce((a:number,b:number)=>a+b,0)/q.length):(responses?50:0),sample=responses>=3?100:responses===2?70:responses===1?35:0,confidence=clamp(coverage*.35+quality*.30+rolePct*.20+sample*.15);return{coverage,rolePct,quality,confidence}})
  const totalPeople=funcs.reduce((s:number,f:any)=>s+(+f.people||0),0)
  const coverage=totalPeople?clamp(rows.reduce((s:number,r:any,i:number)=>s+r.coverage*(+funcs[i]?.people||0),0)/totalPeople):0
  const confidence=rows.length?clamp(rows.reduce((s:number,r:any)=>s+r.confidence,0)/rows.length):0
  const quality=ins.length?clamp(ins.reduce((s:number,i:any)=>s+(+i.qualityScore||0),0)/ins.length):0
  const role=rows.length?clamp(rows.reduce((s:number,r:any)=>s+r.rolePct,0)/rows.length):0
  const ordered=[...ins].sort((a:any,b:any)=>new Date(a.submittedAt||0).getTime()-new Date(b.submittedAt||0).getTime()),recent=ordered.slice(-3),known=new Set(ordered.slice(0,-3).flatMap(themes)),rt=recent.flatMap(themes),novel=[...new Set(rt.filter(t=>!known.has(t)))],saturation=ordered.length<5?0:clamp(100-(rt.length?novel.length/rt.length*100:0))
  let gate='CONTINUA DISCOVERY',gateWhy='Campione ancora insufficiente.',gateHref='/survey-campaign',gateAction='Continua le interviste'
  if(ins.length>=5&&confidence>=75&&coverage>=70&&saturation>=70){gate='PRONTO PER ANALISI';gateWhy='Le evidenze hanno superato il gate di discovery.';gateHref='/opportunity-engine';gateAction='Passa all’Opportunity Engine'}
  else if(ins.length>=3&&(confidence>=50||coverage>=50)){gate='APPROFONDISCI';const gaps=[confidence<75&&`Confidence ${confidence}%`,coverage<70&&`Coverage ${coverage}%`,quality<70&&`Quality ${quality}%`,role<70&&`ruoli ${role}%`,saturation<70&&`Saturation ${saturation}%`].filter(Boolean);gateWhy=`Approfondisci: ${gaps.join(' · ')}.`;gateHref=confidence<75||coverage<70?'/survey-coverage':'/employee-insights';gateAction='Chiudi i gap della discovery'}

  const functionsDefined=funcs.length>0
  const orgComplete=functionsDefined&&funcs.every((f:any)=>f.name&&(+f.people||0)>0&&f.owner)
  const inviteMapped=f03.length>0&&f03.every(i=>i.function_name&&i.recipient_role)
  const imported=ins.length>0
  const qualityChecked=ins.length>0&&quality>0
  const processEvidence=ins.length>=2&&tasks.some((t:any)=>t.sourceSurvey)
  const oppScored=opps.length>0&&opps.every((o:any)=>+o.impact>0&&+o.automation>0)

  const bcBaseline=useCases.length>0&&useCases.every((u:any)=>u.kpi&&Number.isFinite(+u.baseline)&&+u.baseline>0&&Number.isFinite(+u.target)&&+u.target>=0)
  const bcCosts=useCases.length>0&&useCases.every((u:any)=>(+u.setup||0)+(+u.opex||0)>0)
  const bcBenefit=useCases.length>0&&useCases.every((u:any)=>(+u.benefit||0)>0)
  const bcEconomics=useCases.length>0&&useCases.every((u:any)=>{const inv=(+u.setup||0)+(+u.opex||0);return inv>0&&(+u.benefit||0)>0})

  const ownerReady=useCases.length>0&&useCases.every((u:any)=>String(u.owner||'').trim().length>0)
  const readinessData=useCases.length>0&&useCases.every((u:any)=>u.readiness?.data&&u.readiness?.quality&&u.readiness?.integration)
  const readinessRisk=useCases.length>0&&useCases.every((u:any)=>u.readiness?.privacy&&u.readiness?.security&&u.readiness?.compliance&&u.readiness?.human&&u.readiness?.fallback)
  const recordedDecision=governance.some((g:any)=>String(g.type||'').toUpperCase()==='DECISION'&&String(g.status||'').toUpperCase()==='CLOSED')

  const pocPlan=useCases.some((u:any)=>u.poc?.sample&&u.poc?.start&&u.poc?.end)
  const pocOwnership=useCases.some((u:any)=>String(u.owner||'').trim()&&u.poc?.start&&u.poc?.end)||milestones.some((m:any)=>String(m.phase||'').toUpperCase()==='POC'&&String(m.owner||'').trim())
  const pocBaseline=useCases.some((u:any)=>u.kpi&&(+u.baseline||0)>0&&Number.isFinite(+u.target))
  const pocMonitoring=useCases.some((u:any)=>(+u.poc?.actual||0)>0&&(+u.poc?.quality||0)>0&&(+u.poc?.adoption||0)>0)||milestones.some((m:any)=>String(m.phase||'').toUpperCase()==='POC'&&(+m.progress||0)>0)

  const measures=useCases.map((u:any)=>u.measure).filter(Boolean)
  const measureAfter=measures.length>0&&measures.some((m:any)=>(+m.afterTime||0)>0||(+m.afterQuality||0)>0||(+m.afterThroughput||0)>0)
  const measureComparison=measures.length>0&&measures.some((m:any)=>((+m.beforeTime||0)>0&&(+m.afterTime||0)>0)||((+m.beforeQuality||0)>0&&(+m.afterQuality||0)>0)||((+m.beforeThroughput||0)>0&&(+m.afterThroughput||0)>0))
  const realizedBenefit=measures.length>0&&measures.some((m:any)=>(+m.beforeTime||0)>(+m.afterTime||0)&&(+m.volume||0)>0&&(+m.hourCost||0)>0)
  const executiveValidation=measures.length>0&&measures.some((m:any)=>m.date&&String(m.validatedBy||'').trim()&&String(m.notes||'').trim())

  const steps:Step[]=[
   {key:'prepare',phase:'1 · PREPARA',title:'Definisci azienda e funzioni',href:'/?tab=company',action:'Azienda',checks:['Definisci obiettivo e perimetro','Inserisci funzioni/reparti','Indica owner e organico','Carica organigramma/documenti disponibili'],evidence:[!!company.name&&!!company.goal,functionsDefined,orgComplete,docs.length>0]},
   {key:'campaign',phase:'2 · RACCOGLI',title:'Prepara la campagna F03',href:'/survey-campaign',action:'Campaign Manager',checks:['Prepara elenco dipendenti','Assegna funzione e ruolo','Definisci scadenza','Genera inviti F03'],evidence:[f03.length>0,inviteMapped,false,f03.length>0]},
   {key:'listen',phase:'3 · ASCOLTA',title:'Raccogli le interviste',href:'/survey-inbox',action:'Survey Inbox',checks:['Monitora compilazioni','Sollecita mancanti','Rivedi risposte ricevute','Importa risposte valide'],evidence:[f03.length>0,pending.length===0&&f03.length>0,doneInv.length>0,imported]},
   {key:'validate',phase:'4 · VALIDA',title:'Controlla qualità e confidence',href:'/survey-coverage',action:'Assessment Confidence',checks:['Controlla Quality Score','Verifica coverage','Verifica diversità ruoli','Chiudi gap prima dell’analisi'],evidence:[qualityChecked,coverage>0,role>0,gate==='PRONTO PER ANALISI']},
   {key:'understand',phase:'5 · COMPRENDI',title:'Analizza inefficienze',href:'/employee-insights',action:'Employee Insights',checks:['Analizza attività ad alto assorbimento','Raggruppa problemi ricorrenti','Confronta funzioni','Valida i pattern con le persone'],evidence:[processEvidence,ins.length>=2,rows.filter((r:any)=>r.coverage>0).length>=2,false]},
   {key:'prioritize',phase:'6 · PRIORITIZZA',title:'Trasforma evidenze in opportunità',href:'/opportunity-engine',action:'Opportunity Engine',checks:['Crea opportunità dalle evidenze','Stima impatto','Stima fattibilità','Ordina il portfolio'],evidence:[opps.length>0,oppScored,oppScored,opps.length>=3]},
   {key:'business',phase:'7 · DIMOSTRA',title:'Costruisci il business case',href:'/business-case',action:'Business Case Lab',checks:['Definisci baseline','Stima costi','Stima saving/benefici','Calcola ROI e payback'],evidence:[bcBaseline,bcCosts,bcBenefit,bcEconomics]},
   {key:'decide',phase:'8 · DECIDI',title:'Applica readiness e governance',href:'/readiness',action:'AI Readiness Gate',checks:['Assegna owner','Verifica dati e sistemi','Valuta rischi/compliance','Registra decisione Go/No-Go'],evidence:[ownerReady,readinessData,readinessRisk,recordedDecision]},
   {key:'execute',phase:'9 · REALIZZA',title:'Esegui PoC e iniziative',href:'/control-center',action:'Program Control Center',checks:['Definisci piano PoC','Assegna responsabilità e milestone','Registra baseline KPI','Monitora avanzamento e blocchi'],evidence:[pocPlan,pocOwnership,pocBaseline,pocMonitoring]},
   {key:'measure',phase:'10 · MISURA',title:'Misura benefici',href:'/benefits',action:'Benefits Tracker',checks:['Misura KPI after','Confronta con baseline','Registra benefici realizzati','Prepara aggiornamento Direzione'],evidence:[measureAfter,measureComparison,realizedBenefit,executiveValidation]}
  ]

  const enriched=steps.map(s=>{const m=meta[s.key]||{},manual=s.checks.map((_,n)=>!!m.checks?.[n]),effective=s.checks.map((_,n)=>!!s.evidence[n]||manual[n]),done=effective.every(Boolean),autoCount=s.evidence.filter(Boolean).length,d=m.target?daysTo(m.target):null,status=done?'FATTO':!m.target?'PIANIFICARE':(d as number)<0?'IN RITARDO':(d as number)<=7?'ATTENZIONE':'ON TRACK',nextIndex=effective.findIndex(v=>!v),nextCheck=nextIndex>=0?s.checks[nextIndex]:undefined;return{...s,m,manual,effective,done,status,days:d,nextCheck,nextIndex,autoCount}})
  const current=enriched.findIndex(s=>!s.done),completed=enriched.filter(s=>s.done).length,cur=enriched[current<0?enriched.length-1:current]
  let nextAction=cur.nextCheck||`Rivedi e chiudi “${cur.title}”.`,nextHref=cur.href,nextLabel=`Apri ${cur.action}`
  if(cur.key==='prepare'){
   if(cur.nextIndex===0){nextAction='Definisci obiettivo e perimetro dell’assessment aziendale.';nextHref='/?tab=company';nextLabel='Apri Azienda'}
   else if(cur.nextIndex===1){nextAction='Inserisci le funzioni e i reparti che rientrano nel perimetro.';nextHref='/?tab=functions';nextLabel='Apri Funzioni'}
   else if(cur.nextIndex===2){nextAction='Completa owner e organico delle funzioni censite.';nextHref='/?tab=functions';nextLabel='Apri Funzioni'}
   else if(cur.nextIndex===3){nextAction='Carica organigramma e documenti utili alla discovery.';nextHref='/documents';nextLabel='Apri Documenti & Knowledge'}
  }
  if(cur.key==='campaign'){nextHref='/survey-campaign';nextLabel='Apri Campaign Manager'}
  if(cur.key==='listen'){nextHref='/survey-inbox';nextLabel='Apri Survey Inbox'}
  if(cur.key==='validate'){nextHref='/survey-coverage';nextLabel='Apri Assessment Confidence'}
  if(cur.key==='understand'){nextHref='/employee-insights';nextLabel='Apri Employee Insights'}
  if(cur.key==='prioritize'){nextHref='/opportunity-engine';nextLabel='Apri Opportunity Engine'}
  if(cur.key==='business'){nextHref='/business-case';nextLabel='Apri Business Case Lab'}
  if(cur.key==='decide'){nextHref='/readiness';nextLabel='Apri AI Readiness Gate'}
  if(cur.key==='execute'){nextHref='/control-center';nextLabel='Apri Program Control Center'}
  if(cur.key==='measure'){nextHref='/benefits';nextLabel='Apri Benefits Tracker'}
  if(['campaign','listen','validate'].includes(cur.key)&&gate!=='PRONTO PER ANALISI'&&cur.key!=='campaign'){nextAction=gateWhy;nextHref=gateHref;nextLabel=gateAction}
  else if(cur.key==='validate'&&gate==='PRONTO PER ANALISI'){nextAction='Discovery sufficientemente matura: avvia l’analisi delle opportunità.';nextHref='/opportunity-engine';nextLabel='Apri Opportunity Engine'}
  return{steps:enriched,current:current<0?enriched.length-1:current,completed,cur,nextAction,nextHref,nextLabel,gate,confidence,coverage,quality,role,saturation}
 },[data,inv,meta])

 return <main className="journey"><header><div><a href="/?tab=dashboard">← Dashboard</a><small>AI TRANSFORMATION · GUIDED JOURNEY</small><h1>Percorso guidato</h1><p>Il Next Action Engine usa dati reali, checklist e Discovery Gate per decidere cosa fare adesso.</p></div><a className="next" href={j.nextHref}>Continua da qui →</a></header><section className="next-action"><small>PROSSIMA AZIONE CONSIGLIATA · {j.gate}</small><h2>{j.nextAction}</h2><p>Discovery: Confidence <b>{j.confidence}%</b> · Coverage <b>{j.coverage}%</b> · Quality <b>{j.quality}%</b> · Ruoli <b>{j.role}%</b> · Saturation <b>{j.saturation}%</b>.</p><a href={j.nextHref}>{j.nextLabel} →</a></section><section className="journey-summary"><div><b>{j.completed}/{j.steps.length}</b><span>fasi completate</span></div><div className="overall"><i style={{width:`${j.completed/j.steps.length*100}%`}}/></div><div><b>{Math.round(j.completed/j.steps.length*100)}%</b><span>percorso</span></div></section><section className="roadmap">{j.steps.map((s,i)=><article key={s.key} className={`${s.done?'done':''} ${i===j.current?'current':''}`}><div className="marker">{s.done?'✓':i+1}</div><div className="body"><small>{s.phase}</small><h2>{s.title}</h2><details><summary>Checklist operativa e storico · {s.effective.filter(Boolean).length}/{s.checks.length}</summary><div className="checklist">{s.checks.map((c,n)=>{const auto=!!s.evidence[n];return <label key={c} title={auto?'Completato automaticamente dai dati della piattaforma':''}><input type="checkbox" checked={!!s.effective[n]} disabled={auto} onChange={e=>{const a=[...(s.m.checks||[])];a[n]=e.target.checked;save(s.key,{checks:a})}}/>{c}{auto&&<small> · automatico</small>}</label>})}</div><div className="dates"><label>Inizio<input type="date" value={s.m.start||''} onChange={e=>save(s.key,{start:e.target.value})}/></label><label>Target<input type="date" value={s.m.target||''} onChange={e=>save(s.key,{target:e.target.value})}/></label></div><label className="notes">Note<textarea value={s.m.notes||''} onChange={e=>save(s.key,{notes:e.target.value})}/></label></details></div><div className="state"><b className={`health-chip ${s.status.replaceAll(' ','-')}`}>{s.status}</b><small>{s.autoCount}/{s.checks.length} verifiche automatiche · {s.effective.filter(Boolean).length}/{s.checks.length} completate</small><a href={s.href}>{s.action} →</a></div></article>)}</section><section className="journey-help"><h2>Come viene calcolato l’avanzamento</h2><p>Le verifiche che la piattaforma può dimostrare dai dati vengono marcate automaticamente. Le checkbox manuali restano solo per attività che il software non può conoscere con certezza. Una fase è <b>FATTO</b> quando tutte le verifiche risultano soddisfatte.</p><p>Durante la discovery il Decision Gate mantiene il focus sulle interviste finché Coverage, Confidence e Saturation non sono sufficienti.</p><p>{cloud}</p></section></main>}
