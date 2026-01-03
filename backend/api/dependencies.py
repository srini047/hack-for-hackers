"""FastAPI dependencies for dependency injection."""

from fastapi import Depends
from pymongo.database import Database
from db.mongodb import get_database
from db.repositories.project_repository import ProjectRepository
from db.repositories.file_repository import FileRepository


def get_project_repository(db: Database = Depends(get_database)) -> ProjectRepository:
    """Dependency to get ProjectRepository instance."""
    return ProjectRepository(db)


def get_file_repository(db: Database = Depends(get_database)) -> FileRepository:
    """Dependency to get FileRepository instance."""
    return FileRepository(db)
