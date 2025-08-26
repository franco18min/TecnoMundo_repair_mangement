// La URL base está vacía para usar el proxy de Vite.
const API_BASE_URL = '';

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  // La URL ahora es relativa, lo que activa el proxy.
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  // Este es el código estándar para manejar respuestas.
  if (!response.ok) {
    // Intentamos leer el cuerpo del error como JSON.
    const errorData = await response.json();
    // Lanzamos un error con el mensaje específico del backend.
    throw new Error(errorData.detail || `El servidor respondió con un error: ${response.status}`);
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};

// El resto de las funciones también usarán el proxy.
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