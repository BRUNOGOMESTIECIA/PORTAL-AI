import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Lê do ambiente, ou usa default local do Docker
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password@localhost:5433/saas_portal"
)

# Engine do Control Plane (DB principal)
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=10
)

# Fábrica de sessões para o Control Plane
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency inject para pegar sessão do Control Plane no FastAPI."""
    async with AsyncSessionLocal() as session:
        yield session
