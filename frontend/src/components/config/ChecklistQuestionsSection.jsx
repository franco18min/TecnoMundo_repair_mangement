import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChecklistQuestionsSection = () => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Cargar preguntas al montar el componente
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8001/api/v1/predefined-checklist-items/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las preguntas');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8001/api/v1/predefined-checklist-items/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: newQuestion.trim(),
          is_default_selected: false
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la pregunta');
      }

      const newQuestionData = await response.json();
      setQuestions([...questions, newQuestionData]);
      setNewQuestion('');
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateQuestion = async (questionId, updatedData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8001/api/v1/predefined-checklist-items/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la pregunta');
      }

      const updatedQuestion = await response.json();
      setQuestions(questions.map(q => q.id === questionId ? updatedQuestion : q));
      setEditingQuestion(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8001/api/v1/predefined-checklist-items/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la pregunta');
      }

      setQuestions(questions.filter(q => q.id !== questionId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDefaultSelection = async (questionId, currentValue) => {
    await handleUpdateQuestion(questionId, {
      is_default_selected: !currentValue
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Preguntas del Checklist
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona las preguntas predefinidas para el checklist de órdenes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Pregunta
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Question Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Pregunta
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Escribe la pregunta aquí..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewQuestion('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.map((question) => (
            <motion.li
              key={question.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingQuestion === question.id ? (
                    <EditQuestionForm
                      question={question}
                      onSave={(updatedData) => handleUpdateQuestion(question.id, updatedData)}
                      onCancel={() => setEditingQuestion(null)}
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {question.question}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={question.is_default_selected}
                            onChange={() => toggleDefaultSelection(question.id, question.is_default_selected)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-500">Por defecto</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                {editingQuestion !== question.id && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingQuestion(question.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(question.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  Confirmar Eliminación
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  ¿Estás seguro de que deseas eliminar esta pregunta? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(deleteConfirm)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente para editar preguntas
const EditQuestionForm = ({ question, onSave, onCancel }) => {
  const [editedQuestion, setEditedQuestion] = useState(question.question);
  const [isDefaultSelected, setIsDefaultSelected] = useState(question.is_default_selected);

  const handleSave = () => {
    if (!editedQuestion.trim()) return;
    
    onSave({
      question: editedQuestion.trim(),
      is_default_selected: isDefaultSelected
    });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={editedQuestion}
        onChange={(e) => setEditedQuestion(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isDefaultSelected}
            onChange={(e) => setIsDefaultSelected(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Seleccionar por defecto</span>
        </label>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!editedQuestion.trim()}
            className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistQuestionsSection;