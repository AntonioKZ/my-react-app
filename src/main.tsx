import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './calendar.css'
import App from './App.tsx'
import Documents from './Documents.tsx'

const path=window.location.pathname
const content=path.startsWith('/documents')?<Documents/>:<><App/><a className="docs-fab" href="/documents">Documenti & Knowledge</a></>

createRoot(document.getElementById('root')!).render(
  <StrictMode>{content}</StrictMode>,
)
