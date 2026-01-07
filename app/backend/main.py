from fastapi import FastAPI
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from pydantic import BaseModel

# Import our other files
from app.backend.database import create_db_and_tables, get_session


app = FastAPI()

# 1. ALLOW FRONTEND CONNECTION (CRITICAL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. STARTUP EVENT
@app.on_event("startup")
def on_startup():
    create_db_and_tables()
app = FastAPI()

@app.get("/")
def root():
    return {"status": "running"}
