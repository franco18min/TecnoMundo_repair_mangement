import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { checklistService } from '../../../services/checklistService';
import { useAuth } from '../../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

const itemVariants = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } }
};

const buttonVariants = {
  inactive: { scale: 1 },
  active: { scale: 1.1 },
  hover: { scale: 1.05 }
};

export function ChecklistModal({
  isOpen,
  onClose,
  permissions,
  checklistItems,
  handleAddQuestion,
  handleRemoveQuestion,
  handleChecklistChange,
  onLoadDefaultQuestions
}) {
  const { currentUser } = useAuth();
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadPredefinedQuestions();
  }, [isOpen]);

  const loadPredefinedQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const token = localStorage.getItem('accessToken');
      const questions = await checklistService.getAllQuestions(token);
      setPredefinedQuestions(questions);
    } catch (error) {
      console.error('Error al cargar preguntas predefinidas:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleLoadDefaultQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const defaultQuestions = await checklistService.getDefaultQuestions(token);
      if (onLoadDefaultQuestions) {
        onLoadDefaultQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error al cargar preguntas por defecto:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] max-h-[80vh] flex flex-col"
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-indigo-700">Checklist de Recepción</h3>
              <motion.button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => onClose()}
                whileHover={{ scale: 1.05, rotate: 90 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="p-4 overflow-y-auto">
              {permissions.canEditInitialDetails && (
                <motion.div className="mb-4" variants={itemVariants}>
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={handleLoadDefaultQuestions}
                      className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg py-3 px-4 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus size={18} />
                      Cargar preguntas por defecto
                    </motion.button>
                    <motion.select
                      onChange={handleAddQuestion}
                      className="flex-1 bg-gray-50 border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      whileFocus={{ scale: 1.02 }}
                      disabled={isLoadingQuestions}
                    >
                      <option value="">{isLoadingQuestions ? 'Cargando preguntas...' : '+ Añadir pregunta predeterminada...'}</option>
                      {predefinedQuestions.map((q) => (
                        <option key={q.id} value={q.question}>
                          {q.question}
                        </option>
                      ))}
                    </motion.select>
                  </div>
                </motion.div>
              )}

              <motion.div variants={containerVariants} className="space-y-3" layout transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}>
                <AnimatePresence mode="popLayout">
                  {checklistItems.length > 0 ? (
                    checklistItems.map((item, index) => (
                      <motion.div
                        key={`${item.check_description}-${index}`}
                        className="bg-gray-50 p-3 rounded-lg border"
                        variants={itemVariants}
                        layout
                        transition={{ layout: { type: 'spring', stiffness: 280, damping: 28 } }}
                        whileHover={{ scale: 1.01 }}
                        exit="exit"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <motion.p className="text-sm font-medium text-gray-800">{item.check_description}</motion.p>
                          {permissions.canEditInitialDetails && (
                            <motion.button
                              type="button"
                              onClick={() => handleRemoveQuestion(item.check_description)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full"
                              whileHover={{ scale: 1.2, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X size={18} />
                            </motion.button>
                          )}
                        </div>

                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600 w-20">Cliente:</span>
                            {permissions.canEditInitialDetails ? (
                              <>
                                <motion.button
                                  type="button"
                                  onClick={() => handleChecklistChange(index, 'client_answer', true)}
                                  className={`p-2 ${item.client_answer === true ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                                  variants={buttonVariants}
                                  animate={item.client_answer === true ? 'active' : 'inactive'}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <ThumbsUp size={20} strokeWidth={item.client_answer === true ? 2.5 : 1.5} />
                                </motion.button>
                                <motion.button
                                  type="button"
                                  onClick={() => handleChecklistChange(index, 'client_answer', false)}
                                  className={`p-2 ${item.client_answer === false ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                                  variants={buttonVariants}
                                  animate={item.client_answer === false ? 'active' : 'inactive'}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <ThumbsDown size={20} strokeWidth={item.client_answer === false ? 2.5 : 1.5} />
                                </motion.button>
                              </>
                            ) : (
                              <motion.div>
                                {item.client_answer === true ? (
                                  <ThumbsUp size={20} className="text-green-600" strokeWidth={2.5} />
                                ) : (
                                  <ThumbsDown size={20} className="text-red-600" strokeWidth={2.5} />
                                )}
                              </motion.div>
                            )}
                          </div>

                          {permissions.canInteractWithTechnicianChecklist ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-indigo-600 w-20">Técnico:</span>
                              <motion.button
                                type="button"
                                onClick={() => handleChecklistChange(index, 'technician_finding', true)}
                                className={`p-2 ${item.technician_finding === true ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                                variants={buttonVariants}
                                animate={item.technician_finding === true ? 'active' : 'inactive'}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsUp size={20} strokeWidth={item.technician_finding === true ? 2.5 : 1.5} />
                              </motion.button>
                              <motion.button
                                type="button"
                                onClick={() => handleChecklistChange(index, 'technician_finding', false)}
                                className={`p-2 ${item.technician_finding === false ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                                variants={buttonVariants}
                                animate={item.technician_finding === false ? 'active' : 'inactive'}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ThumbsDown size={20} strokeWidth={item.technician_finding === false ? 2.5 : 1.5} />
                              </motion.button>
                              <motion.input
                                type="text"
                                placeholder="Notas..."
                                value={item.technician_notes || ''}
                                onChange={(e) => handleChecklistChange(index, 'technician_notes', e.target.value)}
                                className="text-sm border-b focus:outline-none focus:border-indigo-500 flex-1 ml-2 bg-transparent"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-indigo-600 w-20">Técnico:</span>
                              <div className="p-2 cursor-not-allowed opacity-60">
                                <ThumbsUp size={20} className="text-gray-400" strokeWidth={1.5} />
                              </div>
                              <div className="p-2 cursor-not-allowed opacity-60">
                                <ThumbsDown size={20} className="text-gray-400" strokeWidth={1.5} />
                              </div>
                              <input
                                type="text"
                                placeholder="Notas del técnico..."
                                disabled
                                className="text-sm border-b border-gray-200 flex-1 ml-2 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                              />
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.p className="text-sm text-gray-400 text-center py-4">No se registraron ítems en el checklist.</motion.p>
                  )}
                </AnimatePresence>


              </motion.div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <motion.button
                type="button"
                onClick={() => onClose()}
                className="bg-gray-200 text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
