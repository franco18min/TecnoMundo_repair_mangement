from sqlalchemy.orm import Session
from app.models.user import User as UserModel
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def get_user_by_username(db: Session, username: str):
    """Busca un usuario por su nombre de usuario."""
    return db.query(UserModel).filter(UserModel.username == username).first()

def create_user(db: Session, user: UserCreate):
    """Crea un nuevo usuario en la base de datos."""
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user