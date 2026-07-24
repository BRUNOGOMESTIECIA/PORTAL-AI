import logging
from sqlalchemy.future import select
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from src.saas_portal.database.tenant_models import Document, DocumentChunk
from src.saas_portal.database.tenant_session import get_tenant_session_maker
import pymupdf
import os

logger = logging.getLogger(__name__)

# Configuração do Gemini (Precisa da GOOGLE_API_KEY no .env)
# Para fallback se não tiver chave durante testes locais
api_key = os.getenv("GOOGLE_API_KEY", "mock_key")
if api_key == "mock_key":
    logger.warning("GOOGLE_API_KEY não encontrada! Os embeddings serão mockados na execução.")

try:
    embeddings_model = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004", 
        google_api_key=api_key
    )
except Exception as e:
    logger.error(f"Erro ao inicializar GoogleGenerativeAIEmbeddings: {e}")
    embeddings_model = None


async def index_document_task(tenant_id_str: str, db_connection: str, document_id_str: str, file_path: str):
    """
    Background Task para extrair texto do PDF, chunkar, gerar embeddings
    e salvar no banco de dados do tenant.
    """
    logger.info(f"Iniciando indexação do documento {document_id_str} para tenant {tenant_id_str}")
    
    session_maker = get_tenant_session_maker(tenant_id_str, db_connection)
    
    async with session_maker() as session:
        # Atualiza status para indexing
        result = await session.execute(select(Document).where(Document.id == document_id_str))
        document = result.scalars().first()
        
        if not document:
            logger.error(f"Documento {document_id_str} não encontrado.")
            return
            
        document.status = "indexing"
        await session.commit()
        
        try:
            # 1. Extração de texto (PDF via PyMuPDF)
            text_content = ""
            if file_path.endswith(".pdf"):
                doc = pymupdf.open(file_path)
                for page in doc:
                    text_content += page.get_text() + "\n"
                doc.close()
            else:
                # Fallback para TXT se não for PDF
                with open(file_path, "r", encoding="utf-8") as f:
                    text_content = f.read()

            if not text_content.strip():
                raise ValueError("O documento extraído está vazio.")

            # 2. Chunking (Split de texto)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                is_separator_regex=False,
            )
            chunks = text_splitter.split_text(text_content)
            logger.info(f"Documento dividido em {len(chunks)} chunks.")

            # 3. Geração de Embeddings e Salvar
            for chunk_text in chunks:
                if api_key == "mock_key" or not embeddings_model:
                    # Mock de vetor 768d preenchido com zeros
                    vector = [0.0] * 768
                else:
                    vector = await embeddings_model.aembed_query(chunk_text)
                
                doc_chunk = DocumentChunk(
                    document_id=document.id,
                    content=chunk_text,
                    embedding=vector
                )
                session.add(doc_chunk)

            # 4. Atualizar status final
            document.status = "indexed"
            await session.commit()
            logger.info(f"Indexação concluída com sucesso para o doc {document_id_str}")
            
        except Exception as e:
            logger.error(f"Falha na indexação do documento {document_id_str}: {e}")
            document.status = "error"
            await session.commit()
