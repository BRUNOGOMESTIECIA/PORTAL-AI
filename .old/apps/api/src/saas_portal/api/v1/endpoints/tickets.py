from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from src.saas_portal.database.session import get_db_session
from src.saas_portal.database.models import TenantTifluxConfig, Tenant
from src.saas_portal.services.integrations.tiflux_client import TifluxAPIClient

router = APIRouter()

class TicketCreateRequest(BaseModel):
    subject: str
    description: str
    requester_email: str = "user@example.com"
    requester_name: str = "Usuário do Portal"

@router.post("/")
async def create_ticket(
    data: TicketCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Abre um ticket no Tiflux usando as credenciais do tenant atual.
    """
    tenant: Tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=400, detail="Tenant não resolvido")

    # Buscar configuração do Tiflux para o tenant
    result = await db.execute(select(TenantTifluxConfig).filter(TenantTifluxConfig.tenant_id == tenant.id))
    config = result.scalars().first()

    if not config or not config.is_active:
        raise HTTPException(status_code=400, detail="Integração Tiflux não configurada ou inativa para este tenant")

    client = TifluxAPIClient(
        api_key=config.tiflux_api_key,
        client_id=config.tiflux_client_id,
        desk_id=config.tiflux_desk_id
    )

    response = await client.create_ticket(
        subject=data.subject,
        description=data.description,
        requester_name=data.requester_name,
        requester_email=data.requester_email
    )

    if not response:
        raise HTTPException(status_code=502, detail="Falha ao comunicar com a API do Tiflux")

    # Em uma aplicação madura, salvaríamos o retorno no Tenant DB local (tabela `tickets`)
    return {
        "status": "success",
        "message": "Ticket criado no Tiflux com sucesso",
        "tiflux_response": response
    }
