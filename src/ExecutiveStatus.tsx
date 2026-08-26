import { useEffect, useMemo, useState } from 'react'
import './executive-status.css'

type Milestone={id:string;title:string;phase:string;plannedStart:string;plannedEnd:string;actualStart:string;actualEnd:string;progress:number;status:string;owner:string;notes:string}
type FunctionRow={id:string;name:string;owner:string;people:number;mission:string;systems:string}
type ProcessRow={id:string;name:string;functionId:string;owner:string;lead:number;touch:number;volume:number;pain:string}
type TaskRow={id:string;name:string;processId:string;frequency:number;minutes:number;people:number;cost:number;repeat:number;data:number;judgement:number;pain:string}
type Opportunity={id:string;title:string;source:string;time:number;repeat:number;automation:number;data:number;frequency:number;impact:number;risk:number}
type UseCase={id:string;title:string;owner:string;kpi:string;baseline:number;target:number;setup:number;opex:number;benefit:number;status:string}
type Store={company:{name:string;sector:string;employees:number;sites:string;goal:string;programStart:string};functions:FunctionRow[];processes:ProcessRow[];tasks:TaskRow[];opportunities:Opportunity[];useCases:UseCase[];surveyLog:any[];milestones:Milestone[]}
type Settings={enabled:boolean;cadence:'weekly'|'biweekly'|'monthly';lastReport:string;nextReport:string;recipient:string;preparedBy:string;highlights:string;risks:string;decisions:string}

const iso=(d:Date)=>d.toISOString().slice(0,10)
const today=iso(new Date())
const plusDays=(date:string,days:number)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return iso(d)}
const nextByCadence=(date:string,cadence:Settings['cadence'])=>cadence==='weekly'?plusDays(date,7):cadence==='biweekly'?plusDays(date,14):plusDays(date,30)
const money=(n:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)
const download=(name:string,type:string,body:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
const score=(o:Opportunity)=>Math.max(0,Math.round(((o.time*.25+o.repeat*.20+o.automation*.20+o.data*.15+o.frequency*.10+o.impact*.10)/5)*100-(o.risk-1)*5))

const defaultSettings:Settings={enabled:false,cadence:'monthly',lastReport:'',nextReport:today,recipient:'Direzione',preparedBy:'AI Transformation Manager',highlights:'',risks:'',decisions:''}

export default function ExecutiveStatus(){
 const [data]=useState<Store>(()=>JSON.parse(localStorage.getItem('aito-store')||'{"company":{"name":"Azienda"},"functions":[],"processes":[],"tasks":[],"opportunities":[],"useCases":[],"surveyLog":[],"milestones":[]}'))
 const [settings,setSettings]=useState<Settings>(()=>{try{return{...defaultSettings,...JSON.parse(localStorage.getItem('aito-report-settings')||'{}')}}catch{return defaultSettings}})
 const [message,setMessage]=useState('')
 useEffect(()=>localStorage.setItem('aito-report-settings',JSON.stringify(settings)),[settings])
 const m=useMemo(()=>{
   const milestones=data.milestones||[]
   const done=milestones.filter(x=>x.progress>=100)
   const inProgress=milestones.filter(x=>x.progress>0&&x.progress<100)
   const delayed=milestones.filter(x=>x.progress<100&&x.plannedEnd&&x.plannedEnd<today)
   const upcoming=milestones.filter(x=>x.progress===0&&(!x.plannedEnd||x.plannedEnd>=today)).slice(0,5)
   const planProgress=milestones.length?Math.round(milestones.reduce((s,x)=>s+(Number(x.progress)||0),0)/milestones.length):0
   const hours=(data.tasks||[]).reduce((s,t)=>s+(t.frequency*t.minutes*t.people/60),0)
   const capacity=(data.tasks||[]).reduce((s,t)=>s+(t.frequency*t.minutes*t.people/60*t.cost),0)
   const benefit=(data.useCases||[]).reduce((s,u)=>s+(u.benefit||0),0)
   const invest=(data.useCases||[]).reduce((s,u)=>s+(u.setup||0)+(u.opex||0),0)
   const ownerGaps=(data.functions||[]).filter(x=>!x.owner).length+(data.processes||[]).filter(x=>!x.owner).length
   const avgOpp=(data.opportunities||[]).length?Math.round(data.opportunities.reduce((s,o)=>s+score(o),0)/data.opportunities.length):0
   return{done,inProgress,delayed,upcoming,planProgress,hours,capacity,benefit,invest,roi:invest?Math.round((benefit-invest)/invest*100):0,ownerGaps,avgOpp}
 },[data])
 const due=settings.enabled&&settings.nextReport<=today
 const update=<K extends keyof Settings>(k:K,v:Settings[K])=>setSettings(s=>({...s,[k]:v}))
 const markGenerated=()=>{const next=nextByCadence(today,settings.cadence);setSettings(s=>({...s,lastReport:today,nextReport:next}));setMessage(`Report registrato. Prossima emissione prevista: ${next}.`)}
 const md=()=>`# Executive Status Report — AI Transformation\n\n**Azienda:** ${data.company?.name||'Azienda'}  \n**Data:** ${today}  \n**Destinatario:** ${settings.recipient}  \n**Preparato da:** ${settings.preparedBy}\n\n## 1. Executive summary\n- Avanzamento roadmap: **${m.planProgress}%**\n- Milestone completate: **${m.done.length}**\n- Milestone in corso: **${m.inProgress.length}**\n- Milestone in ritardo: **${m.delayed.length}**\n- Funzioni censite: **${data.functions?.length||0}**\n- Processi censiti: **${data.processes?.length||0}**\n- Task censiti: **${data.tasks?.length||0}**\n- Ore baseline analizzate: **${Math.round(m.hours)} h/anno**\n- Capacity value analizzata: **${money(m.capacity)}**\n- Opportunità: **${data.opportunities?.length||0}** — score medio ${m.avgOpp}/100\n- Use case: **${data.useCases?.length||0}**\n- Beneficio annuo potenziale portfolio: **${money(m.benefit)}**\n- ROI indicativo portfolio: **${m.roi}%**\n\n## 2. Attività completate\n${m.done.length?m.done.map(x=>`- ✅ ${x.id} — ${x.title}${x.actualEnd?` (chiusa ${x.actualEnd})`:''}`).join('\n'):'- Nessuna milestone chiusa nel periodo.'}\n\n## 3. Attività in corso\n${m.inProgress.length?m.inProgress.map(x=>`- 🔄 ${x.id} — ${x.title}: ${x.progress}% | owner: ${x.owner||'da assegnare'} | fine piano: ${x.plannedEnd||'n/d'}`).join('\n'):'- Nessuna attività formalmente in corso.'}\n\n## 4. Ritardi / scostamenti\n${m.delayed.length?m.delayed.map(x=>`- ⚠️ ${x.id} — ${x.title}: ${x.progress}% | scadenza ${x.plannedEnd}`).join('\n'):'- Nessuna milestone in ritardo.'}\n\n## 5. Prossime attività\n${m.upcoming.length?m.upcoming.map(x=>`- ⏭ ${x.id} — ${x.title} | ${x.plannedStart||'n/d'} → ${x.plannedEnd||'n/d'} | owner: ${x.owner||'da assegnare'}`).join('\n'):'- Nessuna attività futura pianificata.'}\n\n## 6. Risultati / evidenze del periodo\n${settings.highlights||'- Da compilare.'}\n\n## 7. Rischi e criticità\n- Owner mancanti su funzioni/processi: ${m.ownerGaps}\n${settings.risks||'- Nessuna ulteriore criticità segnalata.'}\n\n## 8. Decisioni richieste alla Direzione\n${settings.decisions||'- Nessuna decisione richiesta al momento.'}\n\n## 9. Prossima emissione\n${settings.enabled?`Cadenza: ${settings.cadence} — prossima emissione prevista: ${settings.nextReport}`:'Reporting periodico non attivo.'}\n`
 const generate=()=>{download(`executive-status-report-${today}.md`,'text/markdown',md());markGenerated();setTimeout(()=>window.print(),250)}
 return <div className="es-page">
   <header className="es-head"><div><div className="es-kicker">AI TRANSFORMATION OS</div><h1>Executive Status Report</h1><p>Report periodico sintetico per la Direzione: avanzamento, risultati, ritardi, prossime attività, rischi e decisioni.</p></div><a href="/">← Dashboard</a></header>
   <section className={`es-alert ${due?'due':'ok'}`}><strong>{settings.enabled?due?'REPORT DA EMETTERE':'REPORTING ATTIVO':'REPORTING NON ATTIVO'}</strong><span>{settings.enabled?`Prossima emissione: ${settings.nextReport}`:'Attiva la funzione per avere una cadenza e un promemoria operativo.'}</span></section>
   <section className="es-grid">
     <div className="es-card"><b>{m.planProgress}%</b><span>Avanzamento roadmap</span></div><div className="es-card"><b>{m.done.length}</b><span>Completate</span></div><div className="es-card"><b>{m.inProgress.length}</b><span>In corso</span></div><div className="es-card warn"><b>{m.delayed.length}</b><span>In ritardo</span></div><div className="es-card"><b>{Math.round(m.hours)} h</b><span>Baseline annua</span></div><div className="es-card"><b>{money(m.capacity)}</b><span>Capacity value</span></div>
   </section>
   <section className="es-panel"><h2>Configurazione reporting</h2><div className="es-form">
     <label className="switchline"><input type="checkbox" checked={settings.enabled} onChange={e=>update('enabled',e.target.checked)}/><span>Attiva report periodico per la Direzione</span></label>
     <label>Cadenza<select value={settings.cadence} onChange={e=>{const c=e.target.value as Settings['cadence'];setSettings(s=>({...s,cadence:c,nextReport:nextByCadence(s.lastReport||today,c)}))}}><option value="weekly">Settimanale</option><option value="biweekly">Quindicinale</option><option value="monthly">Mensile</option></select></label>
     <label>Destinatario<input value={settings.recipient} onChange={e=>update('recipient',e.target.value)}/></label>
     <label>Preparato da<input value={settings.preparedBy} onChange={e=>update('preparedBy',e.target.value)}/></label>
     <label>Prossima emissione<input type="date" value={settings.nextReport} onChange={e=>update('nextReport',e.target.value)}/></label>
     <label>Ultimo report<input type="date" value={settings.lastReport} onChange={e=>update('lastReport',e.target.value)}/></label>
   </div></section>
   <section className="es-columns"><div className="es-panel"><h2>Attività completate</h2>{m.done.length?m.done.map(x=><div className="es-item" key={x.id}><strong>✅ {x.title}</strong><span>{x.id} · {x.progress}%</span></div>):<p>Nessuna milestone completata.</p>}</div><div className="es-panel"><h2>In corso / ritardo</h2>{[...m.inProgress,...m.delayed.filter(d=>!m.inProgress.some(i=>i.id===d.id))].map(x=><div className="es-item" key={x.id}><strong>{x.plannedEnd<today?'⚠️':'🔄'} {x.title}</strong><span>{x.progress}% · scadenza {x.plannedEnd}</span></div>)}</div></section>
   <section className="es-panel"><h2>Prossime attività</h2>{m.upcoming.map(x=><div className="es-item" key={x.id}><strong>⏭ {x.title}</strong><span>{x.plannedStart} → {x.plannedEnd} · {x.owner}</span></div>)}</section>
   <section className="es-panel"><h2>Note executive del periodo</h2><label>Risultati / evidenze<textarea rows={4} value={settings.highlights} onChange={e=>update('highlights',e.target.value)} placeholder="Esempio: completato assessment di 4 funzioni; raccolti 72 task; identificati 8 pain point ad alto impatto..."/></label><label>Rischi / criticità<textarea rows={3} value={settings.risks} onChange={e=>update('risks',e.target.value)} placeholder="Esempio: bassa risposta F03 in Engineering; manca owner per PROC-0012..."/></label><label>Decisioni richieste alla Direzione<textarea rows={3} value={settings.decisions} onChange={e=>update('decisions',e.target.value)} placeholder="Esempio: approvare Top 3 PoC; confermare owner; autorizzare accesso ai repository..."/></label></section>
   <div className="es-actions"><button onClick={generate}>Genera report + stampa/PDF</button><button className="secondary" onClick={()=>download(`executive-status-report-${today}.md`,'text/markdown',md())}>Esporta Markdown</button></div>{message&&<div className="es-message">{message}</div>}
 </div>
}
