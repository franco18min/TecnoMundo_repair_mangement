# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Crea la aplicación FastAPI
app = FastAPI()

# Configuración de CORS (Cross-Origin Resource Sharing)
# Esto es MUY importante para permitir que tu frontend (en Vercel)
# se comunique con tu backend (en Render).
origins = [
    "http://localhost:5173",  # La URL de tu frontend en desarrollo
    # Aquí deberás añadir la URL de tu frontend cuando lo despliegues en Vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Una ruta de ejemplo para probar que todo funciona
@app.get("/")
def read_root():
    return {"message": "¡Hola desde el backend de FastAPI!"}