// frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { API_CONFIG } from './config/api.js'

// Silenciar mensaje de React DevTools en consola
const originalInfo = console.info.bind(console)
console.info = (...args) => {
  const msg = args && typeof args[0] === 'string' ? args[0] : ''
  if (msg.includes('Download the React DevTools')) return
  originalInfo(...args)
}
const originalError = console.error.bind(console)
console.error = (...args) => {
  const msg = args && typeof args[0] === 'string' ? args[0] : ''
  if (msg.includes('findDOMNode is deprecated')) return
  originalError(...args)
}

const reportClientError = async (payload) => {
  try {
    await fetch(`${API_CONFIG.API_V1_URL}/error-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch { }
}

window.addEventListener('error', (event) => {
  const payload = {
    route: window.location.pathname,
    user_message: 'window.onerror',
    client_context: {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error && (event.error.stack || event.error.toString())
    },
    user_agent: navigator.userAgent
  }
  reportClientError(payload)
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const payload = {
    route: window.location.pathname,
    user_message: 'unhandledrejection',
    client_context: {
      reason: typeof reason === 'string' ? reason : (reason && (reason.stack || reason.toString()))
    },
    user_agent: navigator.userAgent
  }
  reportClientError(payload)
})

createRoot(document.getElementById('root')).render(
  <>
    {/* --- INICIO DE LA CORRECCIÓN --- */}
    {/* ToastProvider debe envolver a AuthProvider */}
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
    {/* --- FIN DE LA CORRECCIÓN --- */}
  </>
)
