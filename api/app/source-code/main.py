from fastapi import FastAPI
from pymongo import MongoClient
import os
from routes import tableRouter

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient(os.environ["MONGODB_CONNSTRING"])
    app.database = app.mongodb_client["street-pongiste"]

@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()

app.include_router(tableRouter,prefix="/tables")