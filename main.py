from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from db import engine
from routers import user_controller  # এখানে শুধু 'routers' হবে

# ডেটাবেজে টেবিল অটো-ক্রিয়েট করার জন্য
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# রাউটার রেজিস্টার করা
app.include_router(user_controller.router)

@app.get("/")
def root():
  return {"message": "API is running successfully!"}


# লোকাল বা সার্ভারে রান করার জন্য এই অংশটুকু যুক্ত করুন
if __name__ == "__main__":
  import os
  import uvicorn

  port = int(os.environ.get("PORT", 8000))
  uvicorn.run("main:app", host="0.0.0.0", port=port)