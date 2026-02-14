from pydantic_settings import BaseSettings


from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "Task Management System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://taskuser:taskpass@localhost:5432/taskdb"
    REDIS_URL: str | None = None
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    CACHE_TTL: int = 300
    SECRET_KEY: str = "your-super-secret-key-min-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: str | None) -> str:
        if not v:
            return v
        
        # Strip potential psql command prefix and quotes
        # Example: psql 'postgresql://...' -> postgresql://...
        v = v.strip()
        if v.startswith("psql "):
            v = v[5:].strip()
        
        # Remove single or double quotes at start/end
        if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
            v = v[1:-1].strip()

        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @field_validator("REDIS_URL")
    @classmethod
    def assemble_redis_connection(cls, v: str | None) -> str | None:
        if not v:
            return v
        
        # Strip potential redis-cli command prefixes
        # Example: redis-cli --tls -u redis://... -> redis://...
        v = v.strip()
        if v.startswith("redis-cli"):
            # Find the -u or --url flag which precedes the actual URL
            import re
            match = re.search(r"-u\s+([^\s]+)", v)
            if match:
                v = match.group(1).strip()
            else:
                # If no -u flag, it might be at the end
                v = v.split()[-1].strip()

        # Remove single or double quotes at start/end
        if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
            v = v[1:-1].strip()
            
        return v

    class Config:
        env_file = ".env"


settings = Settings()