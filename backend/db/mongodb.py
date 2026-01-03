"""MongoDB connection manager using native pymongo."""
from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional
from config import settings


class MongoDB:
    """MongoDB connection manager using native pymongo (synchronous)."""
    
    client: Optional[MongoClient] = None
    database: Optional[Database] = None
    
    @classmethod
    def connect(cls):
        """Establish MongoDB connection."""
        if cls.client is None:
            cls.client = MongoClient(settings.mongodb_uri)
            cls.database = cls.client[settings.mongodb_db_name]
            print(f"✅ Connected to MongoDB: {settings.mongodb_db_name}")
            
            # Create indexes for better performance
            cls._create_indexes()
    
    @classmethod
    def _create_indexes(cls):
        """Create database indexes."""
        if cls.database is not None:
            projects_collection = cls.database["projects"]
            
            # Index on job_id for fast lookups
            projects_collection.create_index("job_id", unique=True)
            
            # Index on status for filtering
            projects_collection.create_index("status")
            
            # Index on created_at for sorting
            projects_collection.create_index("created_at")
            
            print("✅ Database indexes created")
    
    @classmethod
    def close(cls):
        """Close MongoDB connection."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.database = None
            print("❌ MongoDB connection closed")
    
    @classmethod
    def get_database(cls) -> Database:
        """Get the database instance."""
        if cls.database is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return cls.database


# Dependency for FastAPI
def get_database() -> Database:
    """FastAPI dependency to get database instance."""
    return MongoDB.get_database()
