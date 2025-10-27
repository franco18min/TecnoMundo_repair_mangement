// frontend/src/services/checklistService.js

import { API_CONFIG, getAuthHeaders } from '../config/api';

const API_V1_URL = API_CONFIG.API_V1_URL;

export const checklistService = {
  // Obtener todas las preguntas predefinidas
  async getAllQuestions(token) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cargar las preguntas del checklist');
    }

    return response.json();
  },

  // Obtener preguntas marcadas como seleccionadas por defecto
  async getDefaultQuestions(token) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/default`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cargar las preguntas por defecto');
    }

    return response.json();
  },

  // Crear una nueva pregunta
  async createQuestion(token, questionData) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      throw new Error('Error al crear la pregunta');
    }

    return response.json();
  },

  // Actualizar una pregunta existente
  async updateQuestion(token, questionId, questionData) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la pregunta');
    }

    return response.json();
  },

  // Eliminar una pregunta
  async deleteQuestion(token, questionId) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la pregunta');
    }

    return response.json();
  },

  // Actualizar selección por defecto de múltiples preguntas
  async updateDefaultSelection(token, questionIds) {
    const response = await fetch(`${API_V1_URL}/predefined-checklist-items/default-selection`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionIds)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la selección por defecto');
    }

    return response.json();
  }
};