from fastapi import APIRouter, HTTPException
from models.schemas import LoginRequest

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login")
async def login(req: LoginRequest):
    if req.email == "agent@test.com" and req.password == "1234":
        return {
            "success": True,
            "token": "demo-token-123",
            "agent": {"id": 1, "name": "Officer Raksha", "role": "Senior Agent"}
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")