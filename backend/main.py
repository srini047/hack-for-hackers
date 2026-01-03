"""Main FastAPI application using synchronous database operations."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from db.mongodb import MongoDB
from api.routes import project, health, export
from utils.exception import APIException


# Create FastAPI app
app = FastAPI(
    title="Accessible Demo Generator API",
    description="Generate accessible documentation from project demo videos",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,       # type: ignore[arg-type]
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Startup event handler."""
    print("🚀 Starting Accessible Demo Generator API...")
    MongoDB.connect()
    print("✅ Application started successfully")


@app.on_event("shutdown")
def shutdown_event():
    """Shutdown event handler."""
    print("👋 Shutting down...")
    MongoDB.close()
    print("✅ Shutdown complete")


# Exception handlers
@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    """Handle custom API exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred"
        }
    )


# Include routers
app.include_router(health.router)
app.include_router(project.router)
app.include_router(export.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Accessible Demo Generator API",
        "version": "0.1.0",
        "description": "Generate accessible documentation from project demo videos",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "create_project": "POST /api/project/create",
            "get_status": "GET /api/project/{job_id}/status",
            "get_project": "GET /api/project/{job_id}",
            "get_readme": "GET /api/project/{job_id}/readme",
            "get_subtitles": "GET /api/project/{job_id}/subtitles/{format}",
            "get_audio": "GET /api/project/{job_id}/audio-description",
            "update_submission": "POST /api/project/{job_id}/update",
            "export": "GET /api/project/{job_id}/export",
            "download_package": "GET /api/project/{job_id}/download-package",
            "delete_project": "DELETE /api/project/{job_id}"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
