from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid

from src.saas_portal.database.session import get_db_session
from src.saas_portal.database.models import TenantTifluxConfig, Tenant
from src.saas_portal.middlewares.tenant import TenantResolverMiddleware # To get tenant from request ideally, 
from fastapi import Request

router = APIRouter()

class TifluxConfigUpdate(BaseModel):
    api_key: str
    client_id: str
    desk_id: str

@router.get("/tiflux")
async def get_tiflux_config(request: Request, db: AsyncSession = Depends(get_db_session)):
    """
    Retorna a configuração do Tiflux do tenant atual (via middleware).
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant não resolvido")

    result = await db.execute(select(TenantTifluxConfig).filter(TenantTifluxConfig.tenant_id == tenant_id))
    config = result.scalars().first()

    if not config:
        return {"configured": False}
    
    return {
        "configured": True,
        # Em produção, api_key deveria ser mascarada
        "api_key": config.tiflux_api_key[:10] + "..." if config.tiflux_api_key else "", 
        "client_id": config.tiflux_client_id,
        "desk_id": config.tiflux_desk_id,
        "is_active": config.is_active
    }

@router.post("/tiflux")
async def save_tiflux_config(
    data: TifluxConfigUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Salva ou atualiza as configurações do Tiflux para o tenant.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant não resolvido")

    result = await db.execute(select(TenantTifluxConfig).filter(TenantTifluxConfig.tenant_id == tenant_id))
    config = result.scalars().first()

    if config:
        config.tiflux_api_key = data.api_key
        config.tiflux_client_id = data.client_id
        config.tiflux_desk_id = data.desk_id
    else:
        config = TenantTifluxConfig(
            tenant_id=tenant_id,
            tiflux_api_key=data.api_key,
            tiflux_client_id=data.client_id,
            tiflux_desk_id=data.desk_id
        )
        db.add(config)
    
    await db.commit()
    return {"status": "success", "message": "Configurações do Tiflux salvas com sucesso!"}

