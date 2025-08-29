// frontend/src/api/authApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    // --- VERSIÓN CORRECTA ---
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    // Intentamos leer el cuerpo del error como JSON.
    const errorData = await response.json().catch(() => ({ detail: 'El servidor respondió con un error no válido.' }));
    // Lanzamos un error con el mensaje específico del backend.
    throw new Error(errorData.detail || `El servidor respondió con un error: ${response.status}`);
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};

// El resto de las funciones también usarán la URL completa.
export const registerUser = async (username, email, password) => {
  const userData = { username, email, password };
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || `El servidor respondió con un error: ${response.status}`);
  }
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
};