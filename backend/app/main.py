import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .database import Base, engine
from .routers import auth, dashboard, milestone, milestones, projects, users

app = FastAPI(
    title="Govichain API",
    description="Government Project Monitoring System",
    version="1.0.0",
)


@app.on_event("startup")
def startup_event():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("Database connected successfully")

        Base.metadata.create_all(bind=engine)
        print("Database tables verified/created")

    except Exception as exc:
        print("\nERROR: Cannot connect to PostgreSQL database.")
        print("Please ensure PostgreSQL server is running.")
        print(f"Details: {str(exc)}\n")
        sys.exit(1)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(milestones.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(milestone.router)


@app.get("/")
def root():
    return {"message": "Welcome to Govichain API"}


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}
