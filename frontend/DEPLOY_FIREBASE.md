# 🚀 Guía de Despliegue en Firebase

## Pasos para Desplegar el Frontend en Firebase

### 1. Instalar Firebase CLI (si no está instalado)
```bash
npm install -g firebase-tools
```

### 2. Inicializar Firebase en el proyecto (si no está inicializado)
```bash
firebase login
firebase init hosting
```

### 3. Configurar firebase.json
Asegúrate de que el archivo `firebase.json` tenga esta configuración:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4. Construir el proyecto para producción
```bash
npm run build
```

### 5. Desplegar a Firebase
```bash
firebase deploy
```

## URLs del Proyecto

- **Backend (Render):** https://tecnomundo-repair-mangement.onrender.com
- **Frontend (Firebase):** https://tecnomundo-repair-mangement.firebaseapp.com
- **Dominio personalizado:** https://tecnomundo-repair-mangement.web.app

## Variables de Entorno

El proyecto está configurado para usar automáticamente:
- **Desarrollo:** `.env` (http://127.0.0.1:8001)
- **Producción:** `.env.production` (https://tecnomundo-repair-mangement.onrender.com)

## Verificaciones Post-Despliegue

1. ✅ Verificar que el frontend carga correctamente
2. ✅ Probar el login con credenciales de prueba
3. ✅ Verificar que las API calls llegan al backend de Render
4. ✅ Probar las notificaciones WebSocket
5. ✅ Verificar que todas las funcionalidades principales funcionan

## Credenciales de Prueba

- **Usuario:** admin
- **Contraseña:** admin123

## Notas Importantes

- El backend debe estar ejecutándose en Render para que el frontend funcione
- Las configuraciones de CORS ya están actualizadas para permitir el dominio de Firebase
- Todas las URLs de API se configuran automáticamente según el entorno