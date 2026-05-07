from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Notifications"])

@router.get("/notifications")
def get_notifications():
    return [
        {
            "id": 1,
            "title": "High priority call assigned: CALL001",
            "time": "2 min ago"
        },
        {
            "id": 2,
            "title": "Shift handover complete",
            "time": "1 hour ago"
        }
    ]