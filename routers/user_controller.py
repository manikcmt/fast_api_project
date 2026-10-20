from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import schema as schemas
from db import get_db
from repository import UserRepository
from services import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def get_user_service() -> UserService:
    user_repo = UserRepository()
    return UserService(user_repo)

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    service: UserService = Depends(get_user_service)
):
    return service.create_user(db, user)

@router.get("/", response_model=list[schemas.UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    service: UserService = Depends(get_user_service)
):
    return service.get_users(db, skip, limit)

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    service: UserService = Depends(get_user_service)
):
    return service.get_user_by_id(db, user_id)

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    updated_user: schemas.UserCreate,
    db: Session = Depends(get_db),
    service: UserService = Depends(get_user_service)
):
    return service.update_user(db, user_id, updated_user)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    service: UserService = Depends(get_user_service)
):
    return service.delete_user(db, user_id)