// frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { setFaviconFromSupabase } from './utils/branding'

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

// Cargar favicon dinámico desde Supabase al inicio
setFaviconFromSupabase()