import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import StorageBoundary from './StorageBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StorageBoundary><App /></StorageBoundary>
  </StrictMode>,
)
