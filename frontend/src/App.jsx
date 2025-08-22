// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  // CAMBIO AQUÍ: Usamos la variable de entorno
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error al conectar con el backend:", err));
  }, []);

  return (
    <div className="App">
      <h1>Gestor de Reparaciones</h1>
      <p>Mensaje del servidor: <strong>{message}</strong></p>
    </div>
  );
}

export default App;