import React from 'react'
import ReactDOM from 'react-dom/client'
import { Providers }   from './app/providers'
import { AppRouter }   from './app/router'
import { useThemeStore } from './shared/store/useThemeStore'
import './core/styles/tokens.css'
import './core/styles/theme.css'
import './core/styles/base.css'
import './index.css'  

useThemeStore.getState().initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>
)