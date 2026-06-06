import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './core/styles/tokens.css'
import './core/styles/theme.css'
import './core/styles/base.css'
import './index.css'
import { useThemeStore } from './store/useThemeStore'

useThemeStore.getState().initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)