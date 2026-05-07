from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import models
from routers import auth, calls, analytics, notifications
import uuid

# Initialize DB
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="1092 AI Helpline Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health
@app.get("/health")
def health():
    return {"status": "ok"}

# Include Routers
app.include_router(auth.router)
app.include_router(calls.router)
app.include_router(analytics.router)
app.include_router(notifications.router)

# Seed Data on Startup
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    if db.query(models.Call).count() == 0:
        seed_calls = [
            models.Call(
                id="CALL001", citizen="Anonymous", issue="Suspicious person following",
                transcript="Someone is following me near bus stand", emotion="fear",
                priority="high", urgency="high", confidence=91.0, status="live"
            ),
            models.Call(
                id="CALL002", citizen="Rahul Sharma", issue="Road Accident",
                transcript="Minor crash at Silk Board junction", emotion="anxious",
                priority="medium", urgency="medium", confidence=88.0, status="live"
            )
        ]
        db.add_all(seed_calls)
        db.commit()
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)