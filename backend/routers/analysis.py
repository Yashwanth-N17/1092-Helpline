from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard():
    return {
        "stats": {
            "activeCalls": 4,
            "resolvedToday": 21,
            "highPriority": 2,
            "avgResponse": "18 sec"
        },
        "recentCalls": []
    }

@router.get("/analytics")
def get_analytics():
    return {
        "callsToday": 42,
        "resolved": 35,
        "highPriority": 7,
        "topIssues": [
            {"name": "Theft", "count": 11},
            {"name": "Harassment", "count": 8},
            {"name": "Accident", "count": 5}
        ]
    }