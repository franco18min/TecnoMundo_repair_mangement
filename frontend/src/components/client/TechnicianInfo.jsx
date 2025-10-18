import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Star, Award, Calendar } from 'lucide-react';

const TechnicianInfo = ({ technician, orderDate, branchEmail }) => {
  if (!technician) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
      >
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Técnico no asignado</h3>
          <p className="text-gray-500">Se asignará un técnico pronto</p>
        </div>
      </motion.div>
    );
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {getInitials(technician.first_name, technician.last_name)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </motion.div>
          
          <div className="ml-4 flex-1">
            <h3 className="text-xl font-bold">
              {technician.first_name} {technician.last_name}
            </h3>
            <p className="text-green-100 text-sm">Técnico Especializado</p>
            <div className="flex items-center mt-2">
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <span className="ml-2 text-sm text-green-100">5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Información de contacto */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Email de Contacto</p>
              <p className="font-medium text-gray-800">{branchEmail || 'No disponible'}</p>
            </div>
          </div>
          
          {technician.phone && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium text-gray-800">{technician.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas del técnico */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center"
          >
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">150+</p>
            <p className="text-sm text-blue-600">Reparaciones</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center"
          >
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">98%</p>
            <p className="text-sm text-green-600">Satisfacción</p>
          </motion.div>
        </div>

        {/* Especialidades */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {['Smartphones', 'Tablets', 'Laptops', 'Componentes'].map((specialty, index) => (
              <motion.span
                key={specialty}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {specialty}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Fecha de asignación */}
        <div className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <Calendar className="w-5 h-5 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-purple-600">Asignado desde</p>
            <p className="font-medium text-purple-800">{formatDate(orderDate)}</p>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500"
        >
          <p className="text-sm text-gray-700 italic">
            "Tu dispositivo está en las mejores manos. Me comprometo a brindarte un servicio de calidad excepcional."
          </p>
          <p className="text-xs text-gray-500 mt-2 text-right">
            - {technician.first_name} {technician.last_name}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TechnicianInfo;