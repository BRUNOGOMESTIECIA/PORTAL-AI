from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import logging
import os

logger = logging.getLogger(__name__)

api_key = os.getenv("GOOGLE_API_KEY", "mock_key")
try:
    embeddings_model = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=api_key
    )
except Exception as e:
    logger.error(f"Erro ao inicializar embeddings no retriever: {e}")
    embeddings_model = None

async def retrieve_chunks(
    db: AsyncSession,
    query: str,
    top_k: int = 4
) -> list[dict]:
    """
    Realiza a busca vetorial usando pgvector.
    Como MVP (aprovado), pulamos o filtro de grupo.
    """
    if not embeddings_model or api_key == "mock_key":
        logger.warning("Usando mock para a busca vetorial (sem chave API do Gemini)")
        # Retorna mock ou vazio
        query_vector = [0.0] * 768
    else:
        query_vector = await embeddings_model.aembed_query(query)

    # Formatar o vetor para a query SQL (string representando array)
    vector_str = "[" + ",".join(map(str, query_vector)) + "]"

    # Usamos SQLAlchemy text() para usar o operador <=> do pgvector
    sql = text("""
        SELECT 
            c.id, 
            c.content, 
            1 - (c.embedding <=> CAST(:vector AS vector)) as similarity
        FROM document_chunks c
        ORDER BY c.embedding <=> CAST(:vector AS vector)
        LIMIT :top_k
    """)
    
    result = await db.execute(sql, {"vector": vector_str, "top_k": top_k})
    chunks = result.fetchall()
    
    return [
        {
            "id": str(row.id),
            "content": row.content,
            "similarity": float(row.similarity)
        }
        for row in chunks
    ]
