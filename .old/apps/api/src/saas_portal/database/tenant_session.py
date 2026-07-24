import logging
from typing import AsyncGenerator
from fastapi import Request, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from src.saas_portal.database.tenant_models import TenantBase

logger = logging.getLogger(__name__)

# Cache global de engines para evitar criar engine a cada requisição ou BackgroundTask
# Chave: tenant.id (string) -> Valor: async_sessionmaker
tenant_engines = {}

def get_tenant_session_maker(tenant_id_str: str, db_connection: str) -> async_sessionmaker:
    """Obtém ou cria um async_sessionmaker para o inquilino usando cache."""
    if tenant_id_str not in tenant_engines:
        logger.info(f"Criando engine do Tenant DB (ID: {tenant_id_str})")
        engine = create_async_engine(db_connection, echo=False, pool_size=5, max_overflow=10)
        session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        tenant_engines[tenant_id_str] = session_maker
    return tenant_engines[tenant_id_str]

async def get_tenant_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Dependency para rotas de tenant: fornece uma sessão do banco específico do inquilino"""
    if not hasattr(request.state, "tenant_db"):
        raise HTTPException(status_code=400, detail="Tenant não especificado ou não encontrado (Falta header X-Tenant-Slug)")
        
    session_maker = request.state.tenant_db
    async with session_maker() as session:
        yield session

async def create_tenant_database(db_connection: str):
    """Cria o banco de dados do tenant e suas tabelas."""
    engine = create_async_engine(db_connection, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(TenantBase.metadata.create_all)
    await engine.dispose()
