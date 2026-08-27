import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './calendar.css'
import App from './App.tsx'
import Documents from './Documents.tsx'
import SurveyCenter from './SurveyCenter.tsx'
import SurveyLinks from './SurveyLinks.tsx'
import SurveyInbox from './SurveyInbox.tsx'
import SurveyCoverage from './SurveyCoverage.tsx'
import SurveyCampaign from './SurveyCampaign.tsx'
import GuidedJourney from './GuidedJourney.tsx'
import V1Readiness from './V1Readiness.tsx'
import DataVault from './DataVault.tsx'
import ExecutiveStatus from './ExecutiveStatus.tsx'
import PublicSurvey from './PublicSurvey.tsx'
import OpportunityEngine from './OpportunityEngine.tsx'
import BusinessCaseLab from './BusinessCaseLab.tsx'
import ExecutiveCockpit from './ExecutiveCockpit.tsx'
import BenefitsTracker from './BenefitsTracker.tsx'
import Governance from './Governance.tsx'
import ControlCenter from './ControlCenter.tsx'
import ReadinessGate from './ReadinessGate.tsx'
import EmployeeInsights from './EmployeeInsights.tsx'
import CloudSync from './CloudSync.tsx'
import PlatformMenu from './PlatformMenu.tsx'
import ManagerAuthGate from './ManagerAuthGate.tsx'
import F01V2Pilot from './F01V2Pilot.tsx'

const path=window.location.pathname
const publicSurvey=path.startsWith('/survey/')
const page=publicSurvey?<PublicSurvey/>:path.startsWith('/survey-v2/f01')?<F01V2Pilot/>:path.startsWith('/v1-readiness')?<V1Readiness/>:path.startsWith('/journey')?<GuidedJourney/>:path.startsWith('/survey-links')?<SurveyLinks/>:path.startsWith('/survey-campaign')?<SurveyCampaign/>:path.startsWith('/survey-inbox')?<SurveyInbox/>:path.startsWith('/survey-coverage')?<SurveyCoverage/>:path.startsWith('/employee-insights')?<EmployeeInsights/>:path.startsWith('/documents')?<Documents/>:path.startsWith('/surveys')?<SurveyCenter/>:path.startsWith('/data-vault')?<DataVault/>:path.startsWith('/executive-status')?<ExecutiveStatus/>:path.startsWith('/executive-cockpit')?<ExecutiveCockpit/>:path.startsWith('/benefits')?<BenefitsTracker/>:path.startsWith('/governance')?<Governance/>:path.startsWith('/control-center')?<ControlCenter/>:path.startsWith('/readiness')?<ReadinessGate/>:path.startsWith('/opportunity-engine')?<OpportunityEngine/>:path.startsWith('/business-case')?<BusinessCaseLab/>:<App/>

createRoot(document.getElementById('root')!).render(
 <StrictMode>
  {publicSurvey?page:<ManagerAuthGate><>{page}<CloudSync/><PlatformMenu/></></ManagerAuthGate>}
 </StrictMode>
)
