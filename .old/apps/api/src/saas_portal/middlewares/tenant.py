import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession
from sqlalchemy.future import select
from src.saas_portal.database.session import AsyncSessionLocal as ControlPlaneSession
from src.saas_portal.database.models import Tenant
from src.saas_portal.database.tenant_session import get_tenant_session_maker

logger = logging.getLogger(__name__)

class TenantResolverMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Ignorar tenant em rotas não-tenantadas (ex: admin global, docs, health)
        if request.url.path.startswith("/health") or request.url.path.startswith("/docs"):
            return await call_next(request)
            
        tenant_slug = request.headers.get("X-Tenant-Slug")
        
        if not tenant_slug:
            # Em fallback, poderia ler o Host (domain) para resolver
            # Aqui para o MVP exigimos o cabeçalho
            return await call_next(request)
            
        # Buscar informações do tenant no control plane
        async with ControlPlaneSession() as session:
            result = await session.execute(select(Tenant).where(Tenant.slug == tenant_slug))
            tenant = result.scalars().first()
            
            if not tenant:
                # Opcional: pode retornar um 404 se o tenant for obrigatório na rota
                return await call_next(request)
                
            tenant_id_str = str(tenant.id)
            
            session_maker = get_tenant_session_maker(tenant_id_str, tenant.db_connection)
                
            # Salvar no estado do request para injeção posterior
            request.state.tenant_id = tenant.id
            request.state.tenant_slug = tenant.slug
            request.state.tenant_db_connection = tenant.db_connection
            request.state.tenant_db = session_maker
            
        return await call_next(request)
