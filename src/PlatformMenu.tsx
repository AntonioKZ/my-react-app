import {useState} from 'react'
import './platform-menu.css'

type Item={label:string;href:string;desc?:string}
type Group={title:string;items:Item[]}
const groups:Group[]=[
 {title:'Guida & Controllo',items:[
  {label:'Home / Company Model',href:'/',desc:'Azienda, funzioni, processi e task'},
  {label:'Percorso guidato',href:'/journey',desc:'Fasi, checklist, tempi e storico'},
  {label:'Program Control Center',href:'/control-center',desc:'Prossima azione e controllo programma'}]},
 {title:'Discovery & Questionari',items:[
  {label:'Questionari & Assessment',href:'/surveys'},
  {label:'Survey Campaign Manager',href:'/survey-campaign'},
  {label:'Link questionari',href:'/survey-links'},
  {label:'Survey Inbox',href:'/survey-inbox'},
  {label:'Assessment Confidence',href:'/survey-coverage'},
  {label:'Employee Insight Analyzer',href:'/employee-insights'}]},
 {title:'Knowledge & Dati',items:[
  {label:'Documenti & Knowledge',href:'/documents'},
  {label:'Data Vault',href:'/data-vault'}]},
 {title:'Analisi & Valore',items:[
  {label:'Opportunity Engine',href:'/opportunity-engine'},
  {label:'Business Case & PoC',href:'/business-case'},
  {label:'AI Readiness Gate',href:'/readiness'},
  {label:'Benefits Tracker',href:'/benefits'}]},
 {title:'Governance & Direzione',items:[
  {label:'Governance Register',href:'/governance'},
  {label:'Executive KPI Cockpit',href:'/executive-cockpit'},
  {label:'Executive Status Report',href:'/executive-status'}]}
]
export default function PlatformMenu(){const [open,setOpen]=useState(false),path=location.pathname;return <><button className="pm-trigger" onClick={()=>setOpen(v=>!v)} aria-label="Apri menu piattaforma"><span>☰</span><b>Menu</b></button>{open&&<div className="pm-backdrop" onClick={()=>setOpen(false)}/>}<aside className={`pm-drawer ${open?'open':''}`}><header><div><small>AI TRANSFORMATION OS</small><h2>Menu piattaforma</h2></div><button onClick={()=>setOpen(false)}>×</button></header><div className="pm-scroll">{groups.map(g=><section key={g.title}><h3>{g.title}</h3>{g.items.map(i=>{const active=i.href==='/'?path==='/':path.startsWith(i.href);return <a key={i.href} className={active?'active':''} href={i.href}><b>{i.label}</b>{i.desc&&<small>{i.desc}</small>}</a>})}</section>)}</div><footer><a href="/journey">Continua percorso →</a><span>{groups.reduce((n,g)=>n+g.items.length,0)} funzioni disponibili</span></footer></aside></>}
