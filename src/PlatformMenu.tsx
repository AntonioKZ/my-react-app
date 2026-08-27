import {useEffect,useMemo,useState} from 'react'
import './platform-menu.css'

type Item={label:string;href:string;desc?:string;tab?:string;legacyLabel?:string}
type Group={title:string;items:Item[]}
const groups:Group[]=[
 {title:'Guida & Controllo',items:[
  {label:'Dashboard',href:'/?tab=dashboard',tab:'dashboard',legacyLabel:'Dashboard',desc:'Panoramica del programma'},
  {label:'Percorso guidato',href:'/journey',desc:'Fasi, checklist, tempi e storico'},
  {label:'Calendario operativo',href:'/?tab=calendar',tab:'calendar',legacyLabel:'Calendario'},
  {label:'Program Control Center',href:'/control-center',desc:'Prossima azione e controllo programma'}]},
 {title:'Azienda & Discovery',items:[
  {label:'Azienda',href:'/?tab=company',tab:'company',legacyLabel:'Azienda'},
  {label:'Funzioni',href:'/?tab=functions',tab:'functions',legacyLabel:'Funzioni'},
  {label:'Processi',href:'/?tab=processes',tab:'processes',legacyLabel:'Processi'},
  {label:'Task',href:'/?tab=tasks',tab:'tasks',legacyLabel:'Task'},
  {label:'Documenti & Knowledge',href:'/documents'}]},
 {title:'Questionari & Persone',items:[
  {label:'Questionari & Assessment',href:'/surveys'},
  {label:'Survey Campaign Manager',href:'/survey-campaign'},
  {label:'Link questionari',href:'/survey-links'},
  {label:'Survey Inbox',href:'/survey-inbox'},
  {label:'Assessment Confidence',href:'/survey-coverage'},
  {label:'Employee Insight Analyzer',href:'/employee-insights'}]},
 {title:'Analisi & Valore',items:[
  {label:'Opportunità',href:'/?tab=opportunities',tab:'opportunities',legacyLabel:'Opportunità'},
  {label:'Opportunity Engine',href:'/opportunity-engine'},
  {label:'Use case',href:'/?tab=usecases',tab:'usecases',legacyLabel:'Use case'},
  {label:'Business Case & PoC',href:'/business-case'},
  {label:'AI Readiness Gate',href:'/readiness'},
  {label:'Benefits Tracker',href:'/benefits'}]},
 {title:'Governance & Direzione',items:[
  {label:'Governance Register',href:'/governance'},
  {label:'Executive KPI Cockpit',href:'/executive-cockpit'},
  {label:'Executive Status Report',href:'/executive-status'},
  {label:'Dati & Backup',href:'/?tab=data',tab:'data',legacyLabel:'Dati & Backup'},
  {label:'Report',href:'/?tab=report',tab:'report',legacyLabel:'Report'},
  {label:'Data Vault',href:'/data-vault'}]}
]
export default function PlatformMenu(){const [open,setOpen]=useState(false),path=location.pathname,query=useMemo(()=>new URLSearchParams(location.search),[]),activeTab=query.get('tab')||'dashboard';useEffect(()=>{document.body.classList.add('has-platform-menu');if(path==='/'&&query.get('tab')){const wanted=groups.flatMap(g=>g.items).find(i=>i.tab===query.get('tab'));if(wanted?.legacyLabel){setTimeout(()=>{const buttons=[...document.querySelectorAll('.app>aside nav button')] as HTMLButtonElement[];buttons.find(b=>b.textContent?.trim()===wanted.legacyLabel)?.click()},0)}}return()=>document.body.classList.remove('has-platform-menu')},[path,query]);return <><button className="pm-trigger" onClick={()=>setOpen(v=>!v)} aria-label="Apri menu piattaforma"><span>☰</span><b>Menu</b></button>{open&&<div className="pm-backdrop" onClick={()=>setOpen(false)}/>}<aside className={`pm-drawer ${open?'open':''}`}><header><div><small>AI TRANSFORMATION OS</small><h2>Meridionale Impianti</h2></div><button onClick={()=>setOpen(false)}>×</button></header><div className="pm-scroll">{groups.map(g=><section key={g.title}><h3>{g.title}</h3>{g.items.map(i=>{const active=i.tab?(path==='/'&&activeTab===i.tab):(path.startsWith(i.href)&&i.href!=='/');return <a key={i.href+i.label} className={active?'active':''} href={i.href} onClick={()=>setOpen(false)}><b>{i.label}</b>{i.desc&&<small>{i.desc}</small>}</a>})}</section>)}</div><footer><a href="/journey">Continua percorso →</a><span>{groups.reduce((n,g)=>n+g.items.length,0)} funzioni disponibili</span></footer></aside></>}
