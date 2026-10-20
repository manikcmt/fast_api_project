from sqlalchemy.orm import Session
from fastapi import HTTPException
import schema as schemas
from repository import UserRepository

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def create_user(self, db: Session, user: schemas.UserCreate):
        existing_user = self.user_repository.get_by_email(db, user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        return self.user_repository.create(db, user)

    def get_users(self, db: Session, skip: int, limit: int):
        return self.user_repository.get_all(db, skip, limit)

    def get_user_by_id(self, db: Session, user_id: int):
        user = self.user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def update_user(self, db: Session, user_id: int, updated_user: schemas.UserCreate):
        user = self.user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return self.user_repository.update(db, user_id, updated_user)

    def delete_user(self, db: Session, user_id: int):
        user = self.user_repository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        self.user_repository.delete(db, user)
        return None