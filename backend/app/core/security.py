
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional

# --- Configuración de Seguridad ---
SECRET_KEY = "un-secreto-muy-seguro-y-dificil-de-adivinar"
ALGORITHM = "HS256"
# --- INICIO DE LA CORRECCIÓN ---
ACCESS_TOKEN_EXPIRE_MINUTES = 240 # 4 horas (4 * 60 minutos)
# --- FIN DE LA CORRECCIÓN ---

# Contexto para el hash de contraseñas con configuración simple y robusta
# Configuración mínima para evitar problemas con el límite de 72 bytes
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto"
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash."""
    try:
        # Asegurar que la contraseña esté en bytes y truncada correctamente
        if isinstance(plain_password, str):
            password_bytes = plain_password.encode('utf-8')
        else:
            password_bytes = plain_password
        
        # Truncar a 72 bytes (no caracteres) para cumplir con el límite de bcrypt
        truncated_bytes = password_bytes[:72]
        
        # Convertir de vuelta a string, manejando posibles errores de decodificación
        truncated_password = truncated_bytes.decode('utf-8', errors='ignore')
        
        # Verificar con passlib
        return pwd_context.verify(truncated_password, hashed_password)
        
    except Exception as e:
        # Log del error para debugging
        print(f"Error en verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña, truncándola si es necesario."""
    try:
        # Asegurar que la contraseña esté en bytes y truncada correctamente
        if isinstance(password, str):
            password_bytes = password.encode('utf-8')
        else:
            password_bytes = password
        
        # Truncar a 72 bytes (no caracteres) para cumplir con el límite de bcrypt
        truncated_bytes = password_bytes[:72]
        
        # Convertir de vuelta a string, manejando posibles errores de decodificación
        truncated_password = truncated_bytes.decode('utf-8', errors='ignore')
        
        # Generar hash con passlib
        return pwd_context.hash(truncated_password)
        
    except Exception as e:
        # Log del error para debugging
        print(f"Error en get_password_hash: {e}")
        raise e

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un nuevo token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Este es un fallback, pero la lógica de login principal usa ACCESS_TOKEN_EXPIRE_MINUTES
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
