import { useEffect, useMemo, useState } from 'react'
import './App.css'

type FunctionRow={id:string;name:string;owner:string;people:number;mission:string;systems:string}
type ProcessRow={id:string;name:string;functionId:string;owner:string;lead:number;touch:number;volume:number;pain:string}
type TaskRow={id:string;name:string;processId:string;frequency:number;minutes:number;people:number;cost:number;repeat:number;data:number;judgement:number;pain:string}
type Opportunity={id:string;title:string;source:string;time:number;repeat:number;automation:number;data:number;frequency:number;impact:number;risk:number}
type UseCase={id:string;title:string;owner:string;kpi:string;baseline:number;target:number;setup:number;opex:number;benefit:number;status:string}

type Store={company:{name:string;sector:string;employees:number;sites:string;goal:string};functions:FunctionRow[];processes:ProcessRow[];tasks:TaskRow[];opportunities:Opportunity[];useCases:UseCase[]}

const seed:Store={
 company:{name:'Meridionale Impianti',sector:'Impiantistica / Engineering',employees:0,sites:'',goal:'Ridurre inefficienze e aumentare produttività, qualità e capacità operativa'},
 functions:[
  {id:'FUNC-001',name:'R&D / Innovazione',owner:'',people:0,mission:'Ricerca, sviluppo e innovazione',systems:'Microsoft 365'},
  {id:'FUNC-002',name:'Engineering',owner:'',people:0,mission:'Progettazione e documentazione tecnica',systems:'Microsoft 365 / software tecnici'},
  {id:'FUNC-003',name:'Project Management',owner:'',people:0,mission:'Pianificazione, coordinamento e controllo commesse',systems:'Microsoft 365'}
 ],
 processes:[
  {id:'PROC-0001',name:'Scouting bandi e opportunità',functionId:'FUNC-001',owner:'',lead:8,touch:4,volume:8,pain:'Ricerca dispersiva e manuale'},
  {id:'PROC-0002',name:'Analisi documentazione tecnica',functionId:'FUNC-002',owner:'',lead:16,touch:8,volume:12,pain:'Ricerca requisiti e confronto revisioni'},
  {id:'PROC-0003',name:'Weekly project reporting',functionId:'FUNC-003',owner:'',lead:6,touch:3,volume:16,pain:'Raccolta manuale di informazioni'}
 ],
 tasks:[
  {id:'TASK-0001',name:'Ricerca opportunità/bandi',processId:'PROC-0001',frequency:200,minutes:60,people:1,cost:35,repeat:5,data:4,judgement:3,pain:'Molte fonti e verifiche manuali'},
  {id:'TASK-0002',name:'Analisi capitolati e specifiche',processId:'PROC-0002',frequency:100,minutes:120,people:2,cost:40,repeat:4,data:4,judgement:4,pain:'Documenti lunghi e requisiti dispersi'},
  {id:'TASK-0003',name:'Preparazione report progetto',processId:'PROC-0003',frequency:50,minutes:180,people:2,cost:45,repeat:5,data:4,judgement:3,pain:'Dati distribuiti tra email, file e meeting'}
 ],
 opportunities:[
  {id:'OPP-0001',title:'Tender/Bandi Intelligence',source:'TASK-0001',time:5,repeat:5,automation:5,data:4,frequency:5,impact:5,risk:2},
  {id:'OPP-0002',title:'Engineering Document Copilot',source:'TASK-0002',time:5,repeat:4,automation:4,data:4,frequency:4,impact:5,risk:4},
  {id:'OPP-0003',title:'Project Manager Copilot',source:'TASK-0003',time:5,repeat:5,automation:4,data:4,frequency:4,impact:5,risk:3}
 ],
 useCases:[
  {id:'UC-001',title:'Tender/Bandi Intelligence',owner:'',kpi:'Ore ricerca / opportunità qualificate',baseline:60,target:20,setup:8000,opex:3000,benefit:26000,status:'ASSESS'},
  {id:'UC-002',title:'MI Knowledge Assistant',owner:'',kpi:'Tempo medio ricerca documenti',baseline:20,target:5,setup:12000,opex:5000,benefit:42000,status:'IDEA'},
  {id:'UC-003',title:'Project Manager Copilot',owner:'',kpi:'Ore reporting / mese',baseline:30,target:12,setup:10000,opex:4000,benefit:35000,status:'ASSESS'}
 ]
}

const steps=[
 {key:'DISCOVER',label:'Discover',why:'Capire come è fatta l’azienda prima di proporre soluzioni.',need:'Funzioni, responsabili e sistemi principali censiti.'},
 {key:'ASSESS',label:'Assess',why:'Creare una baseline di maturità, dati e criticità.',need:'Assessment T0 e pain point principali.'},
 {key:'MAP',label:'Map',why:'Misurare dove si consumano tempo e capacità.',need:'Processi e task con frequenza, tempi e owner.'},
 {key:'SCORE',label:'Score',why:'Trasformare problemi in opportunità confrontabili.',need:'Opportunity Score calcolabile.'},
 {key:'VALUE',label:'Business case',why:'Concentrare risorse solo dove il valore è credibile.',need:'KPI, target, costi, beneficio e rischio.'},
 {key:'POC',label:'PoC',why:'Dimostrare il risultato su dati reali.',need:'Before/after, campione e GO/NO-GO.'},
 {key:'SCALE',label:'Scale & Review',why:'Industrializzare solo ciò che genera valore.',need:'Owner, governance, monitoraggio e review 30/90/180 giorni.'}
]

const score=(o:Opportunity)=>Math.max(0,Math.round(((o.time*.25+o.repeat*.20+o.automation*.20+o.data*.15+o.frequency*.10+o.impact*.10)/5)*100-(o.risk-1)*5))
const money=(n:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)

function App(){
 const [data,setData]=useState<Store>(()=>{try{return JSON.parse(localStorage.getItem('aito-store')||'null')||seed}catch{return seed}})
 const [tab,setTab]=useState('dashboard'); const [phase,setPhase]=useState(0); const [editing,setEditing]=useState(false)
 useEffect(()=>localStorage.setItem('aito-store',JSON.stringify(data)),[data])
 const metrics=useMemo(()=>{
  const hours=data.tasks.reduce((s,t)=>s+t.frequency*t.minutes*t.people/60,0)
  const capacity=data.tasks.reduce((s,t)=>s+t.frequency*t.minutes*t.people/60*t.cost,0)
  const avg=data.opportunities.length?Math.round(data.opportunities.reduce((s,o)=>s+score(o),0)/data.opportunities.length):0
  const benefit=data.useCases.reduce((s,u)=>s+u.benefit,0), invest=data.useCases.reduce((s,u)=>s+u.setup+u.opex,0)
  return {hours,capacity,avg,benefit,invest,roi:invest?Math.round((benefit-invest)/invest*100):0}
 },[data])
 const completion=Math.min(100,Math.round((data.functions.length>=5?20:data.functions.length*4)+(data.processes.length>=10?20:data.processes.length*2)+(data.tasks.length>=30?25:data.tasks.length*.83)+(data.opportunities.length>=10?20:data.opportunities.length*2)+(data.useCases.length>=3?15:data.useCases.length*5)))
 const current=steps[phase]
 const addFunction=()=>setData(d=>({...d,functions:[...d.functions,{id:`FUNC-${String(d.functions.length+1).padStart(3,'0')}`,name:'Nuova funzione',owner:'',people:0,mission:'',systems:''}]}))
 const addProcess=()=>setData(d=>({...d,processes:[...d.processes,{id:`PROC-${String(d.processes.length+1).padStart(4,'0')}`,name:'Nuovo processo',functionId:d.functions[0]?.id||'',owner:'',lead:0,touch:0,volume:0,pain:''}]}))
 const addTask=()=>setData(d=>({...d,tasks:[...d.tasks,{id:`TASK-${String(d.tasks.length+1).padStart(4,'0')}`,name:'Nuovo task',processId:d.processes[0]?.id||'',frequency:0,minutes:0,people:1,cost:35,repeat:3,data:3,judgement:3,pain:''}]}))
 const snapshot=()=>({snapshot_date:new Date().toISOString(),company:data.company,functions:data.functions,processes:data.processes,tasks:data.tasks,opportunities:data.opportunities.map(o=>({...o,opportunity_score:score(o)})),use_cases:data.useCases,metrics,data_quality:{completion_percent:completion,missing_owners:data.functions.filter(f=>!f.owner).length+data.processes.filter(p=>!p.owner).length}})
 const download=(name:string,type:string,body:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
 const report=()=>{const s=snapshot(); const md=`# Company Intelligence Report\n\n**Snapshot:** ${s.snapshot_date}\n\n## Company\n${s.company.name} — ${s.company.sector}\n\n## Executive snapshot\n- Funzioni: ${s.functions.length}\n- Processi: ${s.processes.length}\n- Task: ${s.tasks.length}\n- Ore baseline analizzate: ${Math.round(metrics.hours)} h/anno\n- Capacity value: ${money(metrics.capacity)}\n- Opportunità: ${s.opportunities.length}\n- Opportunity score medio: ${metrics.avg}/100\n- Use case: ${s.use_cases.length}\n- Beneficio annuo stimato portfolio: ${money(metrics.benefit)}\n- ROI portfolio indicativo: ${metrics.roi}%\n- Completezza dati: ${completion}%\n\n## Functions\n${s.functions.map(f=>`- ${f.id} ${f.name} | owner: ${f.owner||'MANCANTE'} | persone: ${f.people} | sistemi: ${f.systems}`).join('\n')}\n\n## Processes\n${s.processes.map(p=>`- ${p.id} ${p.name} | lead ${p.lead}h / touch ${p.touch}h | pain: ${p.pain}`).join('\n')}\n\n## Tasks\n${s.tasks.map(t=>`- ${t.id} ${t.name} | ${Math.round(t.frequency*t.minutes*t.people/60)} h/a | pain: ${t.pain}`).join('\n')}\n\n## Opportunities\n${s.opportunities.sort((a,b)=>b.opportunity_score-a.opportunity_score).map(o=>`- ${o.id} ${o.title}: ${o.opportunity_score}/100`).join('\n')}\n\n## Use cases\n${s.use_cases.map(u=>`- ${u.id} ${u.title} | ${u.status} | KPI ${u.kpi} | benefit ${money(u.benefit)}`).join('\n')}\n\n## Data gaps\n- Owner mancanti: ${s.data_quality.missing_owners}\n- Completezza: ${completion}%\n`;
  download('company-intelligence-report.md','text/markdown',md);download('company-snapshot.json','application/json',JSON.stringify(s,null,2));setTimeout(()=>window.print(),250)}
 const nav=[['dashboard','Dashboard'],['company','Azienda'],['functions','Funzioni'],['processes','Processi'],['tasks','Task'],['opportunities','Opportunità'],['usecases','Use case'],['report','Report']]
 return <div className="app">
  <aside><div className="brand"><span>AI</span><div>Transformation<br/><b>OS</b></div></div><div className="company-mini">{data.company.name}<small>Single-company workspace</small></div><nav>{nav.map(([k,l])=><button className={tab===k?'active':''} onClick={()=>setTab(k)} key={k}>{l}</button>)}</nav><div className="side-foot"><b>{completion}%</b><span>Discovery completeness</span><div className="progress"><i style={{width:`${completion}%`}}/></div></div></aside>
  <main><header><div><small>AI TRANSFORMATION PROGRAM</small><h1>{nav.find(x=>x[0]===tab)?.[1]}</h1></div><div className="header-actions"><button className="ghost" onClick={()=>setEditing(!editing)}>{editing?'Fine modifica':'Modifica dati'}</button><button className="primary" onClick={report}>Genera report azienda</button></div></header>
  <section className="guide"><div><span className="eyebrow">FASE {phase+1} · {current.label.toUpperCase()}</span><h2>Cosa devi fare adesso</h2><p>{current.need}</p></div><div className="guide-why"><b>Perché</b><p>{current.why}</p></div><div className="phase-controls"><button disabled={phase===0} onClick={()=>setPhase(p=>p-1)}>←</button><strong>{phase+1}/{steps.length}</strong><button disabled={phase===steps.length-1} onClick={()=>setPhase(p=>p+1)}>→</button></div></section>
  {tab==='dashboard'&&<><div className="cards"><Metric label="Funzioni" value={data.functions.length}/><Metric label="Processi" value={data.processes.length}/><Metric label="Task" value={data.tasks.length}/><Metric label="Ore baseline" value={`${Math.round(metrics.hours)} h/a`}/><Metric label="Capacity value" value={money(metrics.capacity)}/><Metric label="Opportunity score" value={`${metrics.avg}/100`}/></div><div className="grid2"><Panel title="Azioni prioritarie"><Action done={data.functions.length>=5} title="Completa la mappa delle funzioni" detail={`${data.functions.length}/5 minimo iniziale`}/><Action done={data.processes.length>=10} title="Mappa i processi prioritari" detail={`${data.processes.length}/10`}/><Action done={data.tasks.length>=30} title="Raccogli i task reali" detail={`${data.tasks.length}/30`}/><Action done={data.functions.every(f=>f.owner)} title="Assegna i responsabili" detail={`${data.functions.filter(f=>!f.owner).length} owner mancanti`}/></Panel><Panel title="Top opportunità">{[...data.opportunities].sort((a,b)=>score(b)-score(a)).slice(0,5).map(o=><div className="rank" key={o.id}><div><b>{o.title}</b><small>{o.source}</small></div><strong>{score(o)}</strong></div>)}</Panel></div></>}
  {tab==='company'&&<Panel title="Profilo azienda"><FormGrid>{Object.entries(data.company).map(([k,v])=><label key={k}>{k}<input disabled={!editing} value={v as any} type={k==='employees'?'number':'text'} onChange={e=>setData(d=>({...d,company:{...d.company,[k]:k==='employees'?+e.target.value:e.target.value}}))}/></label>)}</FormGrid></Panel>}
  {tab==='functions'&&<><Toolbar title="Mappa funzionale" text="Censisci tutte le funzioni e assegna un owner. Il software non valuta persone: descrive il sistema di lavoro." add={addFunction}/><Table headers={['ID','Funzione','Responsabile','Persone','Missione','Sistemi']} rows={data.functions.map((f,i)=>[f.id,<Edit v={f.name} enabled={editing} set={v=>patch('functions',i,'name',v)}/>,<Edit v={f.owner} enabled={editing} set={v=>patch('functions',i,'owner',v)}/>,<Edit v={f.people} enabled={editing} set={v=>patch('functions',i,'people',+v)} type="number"/>,<Edit v={f.mission} enabled={editing} set={v=>patch('functions',i,'mission',v)}/>,<Edit v={f.systems} enabled={editing} set={v=>patch('functions',i,'systems',v)}/>])}/></>}
  {tab==='processes'&&<><Toolbar title="Process mapping" text="Misura lead time e touch time: la differenza evidenzia attese, handoff e colli di bottiglia." add={addProcess}/><Table headers={['ID','Processo','Funzione','Owner','Lead h','Touch h','Vol/mese','Pain point']} rows={data.processes.map((p,i)=>[p.id,<Edit v={p.name} enabled={editing} set={v=>patch('processes',i,'name',v)}/>,data.functions.find(f=>f.id===p.functionId)?.name||p.functionId,<Edit v={p.owner} enabled={editing} set={v=>patch('processes',i,'owner',v)}/>,<Edit v={p.lead} enabled={editing} set={v=>patch('processes',i,'lead',+v)} type="number"/>,<Edit v={p.touch} enabled={editing} set={v=>patch('processes',i,'touch',+v)} type="number"/>,p.volume,<Edit v={p.pain} enabled={editing} set={v=>patch('processes',i,'pain',v)}/>])}/></>}
  {tab==='tasks'&&<><Toolbar title="Task inventory" text="Una riga = una attività reale. Inserisci frequenza, tempo e persone per quantificare la capacità assorbita." add={addTask}/><Table headers={['ID','Task','Processo','Freq/a','Min','Persone','Ore/a','Valore','Pain point']} rows={data.tasks.map((t,i)=>[t.id,<Edit v={t.name} enabled={editing} set={v=>patch('tasks',i,'name',v)}/>,data.processes.find(p=>p.id===t.processId)?.name||t.processId,<Edit v={t.frequency} enabled={editing} set={v=>patch('tasks',i,'frequency',+v)} type="number"/>,<Edit v={t.minutes} enabled={editing} set={v=>patch('tasks',i,'minutes',+v)} type="number"/>,t.people,`${Math.round(t.frequency*t.minutes*t.people/60)}h`,money(t.frequency*t.minutes*t.people/60*t.cost),<Edit v={t.pain} enabled={editing} set={v=>patch('tasks',i,'pain',v)}/>])}/></>}
  {tab==='opportunities'&&<><Toolbar title="Opportunity engine" text="Lo score combina tempo, ripetitività, automabilità, dati, frequenza, impatto e rischio."/><Table headers={['ID','Opportunità','Fonte','Tempo','Repeat','Auto','Dati','Impatto','Rischio','Score','Classe']} rows={[...data.opportunities].sort((a,b)=>score(b)-score(a)).map(o=>[o.id,o.title,o.source,o.time,o.repeat,o.automation,o.data,o.impact,o.risk,<b>{score(o)}</b>,score(o)>=80?'IMMEDIATE':score(o)>=60?'POC':score(o)>=40?'AUGMENT':'LOW'])}/></>}
  {tab==='usecases'&&<><Toolbar title="Use case portfolio" text="Nessun use case passa a PoC senza owner, KPI, target, costi, beneficio e rischio."/><div className="kanban">{['IDEA','ASSESS','POC','PRODUCTION'].map(st=><div className="lane" key={st}><h3>{st}</h3>{data.useCases.filter(u=>u.status===st).map(u=><div className="uc" key={u.id}><small>{u.id}</small><b>{u.title}</b><span>{u.kpi}</span><div><em>{money(u.benefit)}/a</em><strong>{Math.round((u.benefit-u.setup-u.opex)/(u.setup+u.opex)*100)}% ROI</strong></div></div>)}</div>)}</div></>}
  {tab==='report'&&<><div className="report-hero"><div><span className="eyebrow">COMPANY INTELLIGENCE REPORT</span><h2>Una fotografia completa e AI-ready dell'azienda.</h2><p>Genera in qualsiasi momento PDF tramite stampa, Markdown e JSON strutturato. I dati mancanti restano espliciti: il sistema non inventa valori.</p><button className="primary big" onClick={report}>Genera Report Pack</button></div><div className="report-list"><b>Il pacchetto contiene</b><span>Executive snapshot</span><span>Functional & systems map</span><span>Process & task inventory</span><span>Pain point & opportunity map</span><span>Use case & ROI portfolio</span><span>Data gaps + AI-ready JSON</span></div></div><div className="cards"><Metric label="Completezza" value={`${completion}%`}/><Metric label="Owner mancanti" value={data.functions.filter(f=>!f.owner).length+data.processes.filter(p=>!p.owner).length}/><Metric label="Record totali" value={data.functions.length+data.processes.length+data.tasks.length+data.opportunities.length+data.useCases.length}/><Metric label="Snapshot" value={new Date().toLocaleDateString('it-IT')}/></div></>}
  </main>
 </div>
 function patch<K extends keyof Store>(section:K,index:number,key:string,value:any){setData(d=>{const arr=[...(d[section] as any[])];arr[index]={...arr[index],[key]:value};return {...d,[section]:arr}})}
}

function Metric({label,value}:{label:string;value:any}){return <div className="metric"><span>{label}</span><strong>{value}</strong></div>}
function Panel({title,children}:{title:string;children:any}){return <div className="panel"><h3>{title}</h3>{children}</div>}
function Action({done,title,detail}:{done:boolean;title:string;detail:string}){return <div className={`action ${done?'done':''}`}><i>{done?'✓':'!'}</i><div><b>{title}</b><small>{detail}</small></div></div>}
function Toolbar({title,text,add}:{title:string;text:string;add?:()=>void}){return <div className="toolbar"><div><h2>{title}</h2><p>{text}</p></div>{add&&<button className="primary" onClick={add}>+ Aggiungi</button>}</div>}
function Table({headers,rows}:{headers:string[];rows:any[][]}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
function Edit({v,set,enabled,type='text'}:{v:any;set:(v:string)=>void;enabled:boolean;type?:string}){return enabled?<input className="cell-edit" type={type} value={v} onChange={e=>set(e.target.value)}/>:<>{v||<span className="missing">Mancante</span>}</>}
function FormGrid({children}:{children:any}){return <div className="form-grid">{children}</div>}

export default App
