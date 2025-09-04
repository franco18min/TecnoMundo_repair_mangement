// frontend/src/api/authApi.js

const API_BASE_URL = 'http://127.0.0.1:8001';

/**
 * Autentica a un usuario y guarda el token de acceso.
 */
export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Error de autenticación.' }));
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};

/**
 * Obtiene los datos del usuario actualmente autenticado usando el token.
 */
export const getCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error("No hay token de acceso.");

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            logoutUser(); // Limpia el token inválido
        }
        throw new Error("No se pudo obtener la información del usuario.");
    }
    return await response.json();
};

/**
 * Registra un nuevo usuario en el sistema.
 */
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

/**
 * Elimina el token de acceso del almacenamiento local para cerrar la sesión.
 */
export const logoutUser = () => {
  localStorage.removeItem('accessToken');
};