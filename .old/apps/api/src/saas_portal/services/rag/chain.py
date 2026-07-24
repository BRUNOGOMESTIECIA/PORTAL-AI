import logging
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from src.saas_portal.services.rag.retriever import retrieve_chunks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

api_key = os.getenv("GOOGLE_API_KEY", "mock_key")

def get_llm():
    if api_key == "mock_key":
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.0
    )

SYSTEM_PROMPT = """Você é um assistente virtual de suporte ao cliente.
Responda a pergunta do usuário APENAS com base nos documentos de contexto fornecidos abaixo.
Se a resposta não estiver contida no contexto, informe que não encontrou a informação e sugira que o usuário fale com um humano.

CONTEXTO:
{context}
"""

async def generate_chat_stream(db: AsyncSession, query: str) -> AsyncGenerator[str, None]:
    """
    Gera a resposta do chat em streaming (Server-Sent Events).
    """
    try:
        # 1. Recuperar contexto (RAG)
        chunks = await retrieve_chunks(db, query)
        
        # Opcional: Se a confiança/similaridade do topo for baixa, podemos engatilhar handoff direto.
        # Por enquanto vamos passar para o LLM.
        
        context_text = "\n\n---\n\n".join([c["content"] for c in chunks])
        
        llm = get_llm()
        if not llm:
            # Modo mock para testes locais sem API KEY
            yield f"data: {json.dumps({'content': 'Modo Mock: '})}\n\n"
            yield f"data: {json.dumps({'content': 'Baseado nos documentos: ' + str(len(chunks)) + ' chunks recuperados.'})}\n\n"
            yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
            return
            
        system_message = SystemMessage(content=SYSTEM_PROMPT.format(context=context_text))
        human_message = HumanMessage(content=query)
        
        # 2. Invocação do LLM com streaming
        async for chunk in llm.astream([system_message, human_message]):
            if chunk.content:
                # Retorna em formato SSE
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"
                
        # Marcador de fim
        yield f"data: {json.dumps({'content': '[DONE]'})}\n\n"
        
    except Exception as e:
        logger.error(f"Erro no chat stream: {e}")
        yield f"data: {json.dumps({'error': 'Erro ao processar a requisição'})}\n\n"
