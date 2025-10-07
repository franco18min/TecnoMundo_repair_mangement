// frontend/src/services/checklistService.js

const API_BASE_URL = 'http://localhost:8001/api/v1';

export const checklistService = {
  // Obtener todas las preguntas predefinidas
  async getAllQuestions(token) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar las preguntas del checklist');
    }

    return response.json();
  },

  // Obtener preguntas marcadas como seleccionadas por defecto
  async getDefaultQuestions(token) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/default`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar las preguntas por defecto');
    }

    return response.json();
  },

  // Crear una nueva pregunta
  async createQuestion(token, questionData) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      throw new Error('Error al crear la pregunta');
    }

    return response.json();
  },

  // Actualizar una pregunta existente
  async updateQuestion(token, questionId, questionData) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/${questionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la pregunta');
    }

    return response.json();
  },

  // Eliminar una pregunta
  async deleteQuestion(token, questionId) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la pregunta');
    }

    return response.json();
  },

  // Actualizar selección por defecto de múltiples preguntas
  async updateDefaultSelection(token, questionIds) {
    const response = await fetch(`${API_BASE_URL}/predefined-checklist-items/default-selection`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questionIds)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la selección por defecto');
    }

    return response.json();
  }
};