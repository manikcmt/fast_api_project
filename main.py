from fastapi import FastAPI
import models
from db import engine
from routers import user_controller  # এখানে শুধু 'routers' হবে

# ডেটাবেজে টেবিল অটো-ক্রিয়েট করার জন্য
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI MySQL Object-Oriented Clean Architecture")

# রাউটার রেজিস্টার করা
app.include_router(user_controller.router)