// frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* --- INICIO DE LA CORRECCIÓN --- */}
    {/* ToastProvider debe envolver a AuthProvider */}
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
    {/* --- FIN DE LA CORRECCIÓN --- */}
  </StrictMode>,
)

