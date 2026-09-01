import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><AppRoutes /></BrowserRouter></StrictMode>)
