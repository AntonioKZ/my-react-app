import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './calendar.css'
import App from './App.tsx'
import Documents from './Documents.tsx'
import SurveyCenter from './SurveyCenter.tsx'
import SurveyLinks from './SurveyLinks.tsx'
import SurveyInbox from './SurveyInbox.tsx'
import DataVault from './DataVault.tsx'
import ExecutiveStatus from './ExecutiveStatus.tsx'
import PublicSurvey from './PublicSurvey.tsx'
import OpportunityEngine from './OpportunityEngine.tsx'
import BusinessCaseLab from './BusinessCaseLab.tsx'
import CloudSync from './CloudSync.tsx'
const path=window.location.pathname
const page=path.startsWith('/survey/')?<PublicSurvey/>:path.startsWith('/survey-links')?<SurveyLinks/>:path.startsWith('/survey-inbox')?<SurveyInbox/>:path.startsWith('/documents')?<Documents/>:path.startsWith('/surveys')?<SurveyCenter/>:path.startsWith('/data-vault')?<DataVault/>:path.startsWith('/executive-status')?<ExecutiveStatus/>:path.startsWith('/opportunity-engine')?<OpportunityEngine/>:path.startsWith('/business-case')?<BusinessCaseLab/>:<><App/><a className="vault-fab" href="/data-vault">Data Vault</a><a className="survey-fab" href="/surveys">Questionari & Assessment</a><a className="docs-fab" href="/documents">Documenti & Knowledge</a><a className="status-fab" href="/executive-status">Executive Status</a></>
const managerPage=!path.startsWith('/survey/')
createRoot(document.getElementById('root')!).render(<StrictMode>{page}{managerPage&&<CloudSync/>}</StrictMode>)
