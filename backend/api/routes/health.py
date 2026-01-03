"""Health check endpoints."""

from fastapi import APIRouter, Depends
from pymongo.database import Database
from db.mongodb import get_database

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Status information
    """
    return {
        "status": "healthy",
        "service": "accessible-demo-generator",
        "version": "0.1.0",
    }


@router.get("/health/db")
async def database_health(db: Database = Depends(get_database)):
    """
    Check database connectivity.

    Returns:
        Database status
    """
    try:
        # Ping database
        db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
