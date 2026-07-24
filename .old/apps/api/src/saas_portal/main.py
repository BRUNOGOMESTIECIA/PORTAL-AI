from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

from src.saas_portal.middlewares.tenant import TenantResolverMiddleware
from src.saas_portal.database.tenant_session import get_tenant_session
from src.saas_portal.api.v1.endpoints import articles, chat, integrations, tickets, users, tenants
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SaaS Portal API",
    version="1.0.0",
    description="API para o Portal de Autoatendimento Multi-Tenant"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir frontend local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantResolverMiddleware)

app.include_router(articles.router, prefix="/api/v1/articles", tags=["articles"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(integrations.router, prefix="/api/v1/integrations", tags=["integrations"])
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["tickets"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["tenants"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "saas-portal-api"}

@app.get("/api/v1/tenant-info")
async def get_tenant_info(request: Request, db: AsyncSession = Depends(get_tenant_session)):
    # Testar se a conexão com o tenant db está funcionando e retornar o nome
    result = await db.execute(text("SELECT current_database();"))
    db_name = result.scalar()
    
    return {
        "tenant_id": request.state.tenant_id,
        "tenant_slug": request.state.tenant_slug,
        "connected_db": db_name
    }

