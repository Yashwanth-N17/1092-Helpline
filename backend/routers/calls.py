from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.models import Call
from services.ai import analyze_text_logic
from models.schemas import AnalyzeRequest

router = APIRouter(prefix="/api", tags=["Calls"])

@router.get("/calls/active")
def get_active_calls(db: Session = Depends(get_db)):
    calls = db.query(Call).filter(Call.status == "live").all()
    return [{
        "id": c.id,
        "citizen": c.citizen,
        "issue": c.issue,
        "emotion": c.emotion,
        "priority": c.priority,
        "time": "00:28" 
    } for c in calls]

@router.get("/calls/{callId}")
def get_call_detail(callId: str, db: Session = Depends(get_db)):
    return db.query(Call).filter(Call.id == callId).first()

@router.post("/analyze-text")
def analyze_text(req: AnalyzeRequest):
    return analyze_text_logic(req.text)

@router.post("/calls/{callId}/resolve")
def resolve_call(callId: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == callId).first()
    if call:
        call.status = "resolved"
        db.commit()
    return {"success": True}

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    return db.query(Call).filter(Call.status == "resolved").all()