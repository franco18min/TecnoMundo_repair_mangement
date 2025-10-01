# 🔧 TecnoMundo Repair Management

Sistema integral de gestión de órdenes de reparación para dispositivos electrónicos, desarrollado con FastAPI y React.

## 🚀 Características Principales

- **Gestión Completa de Órdenes**: Crear, actualizar y rastrear órdenes de reparación
- **Sistema de Usuarios**: Autenticación JWT con roles (Admin, Técnico)
- **Notificaciones en Tiempo Real**: WebSocket para actualizaciones instantáneas
- **Gestión Multi-Sucursal**: Transferencia de órdenes entre sucursales
- **Monitoreo Avanzado**: Sistema de logging y alertas en tiempo real
- **Interfaz Moderna**: UI responsive con React y TailwindCSS

## 🏗️ Arquitectura

### Backend (FastAPI)
- **Framework**: FastAPI 0.116.1
- **Base de Datos**: PostgreSQL con SQLAlchemy
- **Autenticación**: JWT con bcrypt
- **WebSocket**: Notificaciones en tiempo real
- **Monitoreo**: Sistema de métricas y alertas

### Frontend (React)
- **Framework**: React 18 con Vite
- **Estilos**: TailwindCSS
- **Animaciones**: Framer Motion
- **Estado**: Context API
- **Routing**: React Router

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+

### Configuración del Backend

```bash
# Clonar repositorio
git clone https://github.com/franco18min/TecnoMundo_repair_mangement.git
cd TecnoMundo_repair_mangement

# Configurar backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
uvicorn main:app --reload --port 8001
```

### Configuración del Frontend

```bash
# En otra terminal
cd frontend
npm install
npm run dev
```

## 🔐 Credenciales de Prueba

### Usuario Administrador
- **Username**: admin
- **Password**: admin123
- **Email**: admin@tecnomundo.com

### Usuario Técnico
- **Username**: tecnico1
- **Password**: tecnico123
- **Email**: tecnico1@tecnomundo.com

## 📊 Base de Datos

### Schemas
- **customer**: Gestión de clientes y órdenes
- **system**: Usuarios, roles y configuración

### Tablas Principales
- `repair_order`: Órdenes de reparación
- `customer`: Información de clientes
- `user`: Usuarios del sistema
- `device_condition`: Checklist de dispositivos

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Documentación API**: http://localhost:8001/docs
- **WebSocket**: ws://localhost:8001/ws

## 🚀 Despliegue

### Producción
- **Frontend**: Firebase Hosting
- **Backend**: Render
- **Base de Datos**: PostgreSQL en Render

### Scripts de Despliegue
```bash
# Despliegue completo
./scripts/deploy.sh production

# Solo staging
./scripts/deploy.sh staging

# Rollback de emergencia
./scripts/deploy.sh rollback
```

## 📁 Estructura del Proyecto

```
TecnoMundo_repair_mangement/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configuración y seguridad
│   │   ├── crud/           # Operaciones de base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   └── schemas/        # Esquemas Pydantic
│   └── requirements.txt
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas principales
│   │   ├── context/        # Context API
│   │   └── utils/          # Utilidades
│   └── package.json
├── docs/                   # Documentación
├── scripts/                # Scripts de automatización
├── monitoring/             # Configuración de monitoreo
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
```bash
# Crear usuario administrador
python scripts/create_user.py

# Configurar monitoreo
python scripts/setup-monitoring.py
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📈 Monitoreo y Logging

- **Métricas**: CPU, memoria, tiempo de respuesta
- **Alertas**: Email, Slack, Discord
- **Logs**: Formato JSON estructurado
- **Health Checks**: Endpoints automáticos

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT
- WebSocket
- Redis

### Frontend
- React
- Vite
- TailwindCSS
- Framer Motion
- React Router

### DevOps
- Firebase
- Render
- GitHub Actions
- Docker (opcional)

## 📝 Documentación Adicional

- [Flujo de Despliegue](docs/DEPLOYMENT_WORKFLOW.md)
- [Procedimientos de Emergencia](docs/EMERGENCY_PROCEDURES.md)
- [Flujo de Trabajo](docs/WORKFLOW.md)
- [Configuración de Agentes IA](docs/AGENTS.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Franco
- **Proyecto**: TecnoMundo Repair Management
- **Versión**: 1.0.0

---

⚡ **Desarrollado con FastAPI y React para máximo rendimiento y experiencia de usuario**