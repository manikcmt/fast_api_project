from sqlalchemy import Column, Integer, String
from db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), index=True)
    email = Column(String(100), unique=True, index=True)
    age = Column(Integer)