from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import uuid
import json

from src.saas_portal.database.tenant_session import get_tenant_session
from src.saas_portal.database.tenant_models import AISession, AISessionMessage
from src.saas_portal.services.rag.chain import generate_chat_stream

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_token: str = None # Pode vir nulo para primeira mensagem

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_tenant_session)
):
    """
    Inicia o RAG e retorna a resposta em formato SSE (Server-Sent Events).
    """
    # 1. Recupera ou cria sessão (simplificado para o MVP)
    # 2. Salva a mensagem do usuário (na vida real esperaríamos a resposta para salvar as duas juntas ou salvaria antes)
    # Como o streaming fecha, podemos salvar a pergunta aqui. A resposta nós deixamos para a UI salvar 
    # ou modificamos o gerador para salvar a resposta no final.
    # Por simplicidade, salvaremos apenas a query no momento (MVP) e no front simulamos.
    # Numa versão madura, envolveríamos a execução em uma transação ou salvaríamos depois de completado.
    
    return StreamingResponse(
        generate_chat_stream(db, request.message),
        media_type="text/event-stream"
    )
