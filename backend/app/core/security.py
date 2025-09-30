
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

# Contexto para el hash de contraseñas con configuración robusta
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12,  # Configuración explícita de rounds
    bcrypt__ident="2b"  # Usar identificador 2b para mejor compatibilidad
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con su hash."""
    # Asegurar que la contraseña esté en bytes y truncada correctamente
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    # Truncar a 72 bytes (no caracteres)
    truncated_password = plain_password[:72].decode('utf-8', errors='ignore')
    return pwd_context.verify(truncated_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña, truncándola si es necesario."""
    # Asegurar que la contraseña esté en bytes y truncada correctamente
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Truncar a 72 bytes (no caracteres)
    truncated_password = password[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(truncated_password)

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
