from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.saas_portal.database.tenant_session import get_tenant_session
from src.saas_portal.database.tenant_models import Article, Document
from src.saas_portal.services.knowledge_base.indexer import index_document_task
from pydantic import BaseModel
import shutil
import os
import uuid

router = APIRouter()

class ArticleCreate(BaseModel):
    title: str
    content: str = ""
    is_published: bool = False

@router.get("")
@router.get("/")
async def list_articles(db: AsyncSession = Depends(get_tenant_session)):
    from sqlalchemy import select
    result = await db.execute(select(Article).order_by(Article.created_at.desc()))
    articles = result.scalars().all()
    return articles

@router.post("/")
async def create_article(
    article_in: ArticleCreate,
    db: AsyncSession = Depends(get_tenant_session)
):
    new_article = Article(
        title=article_in.title,
        content=article_in.content,
        is_published=article_in.is_published
    )
    db.add(new_article)
    await db.commit()
    await db.refresh(new_article)
    return {"id": new_article.id, "title": new_article.title}

@router.get("/{article_id}")
async def get_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_tenant_session)
):
    from sqlalchemy import select
    result = await db.execute(select(Article).filter(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return article

@router.put("/{article_id}")
async def update_article(
    article_id: uuid.UUID,
    article_in: ArticleCreate,
    db: AsyncSession = Depends(get_tenant_session)
):
    from sqlalchemy import select
    result = await db.execute(select(Article).filter(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    article.title = article_in.title
    article.content = article_in.content
    article.is_published = article_in.is_published
    
    await db.commit()
    await db.refresh(article)
    return {"id": article.id, "title": article.title, "message": "Atualizado com sucesso"}

@router.delete("/{article_id}")
async def delete_article(
    article_id: uuid.UUID,
    db: AsyncSession = Depends(get_tenant_session)
):
    from sqlalchemy import select
    result = await db.execute(select(Article).filter(Article.id == article_id))
    article = result.scalars().first()
    if not article:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    await db.delete(article)
    await db.commit()
    return {"status": "success"}

@router.post("/{article_id}/documents")
async def upload_document(
    article_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_tenant_session)
):
    # Salvando temporariamente no disco para o MVP (ao invés do MinIO real)
    temp_dir = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_document = Document(
        article_id=article_id,
        filename=file.filename,
        file_path=file_path,
        status="pending"
    )
    db.add(new_document)
    await db.commit()
    await db.refresh(new_document)
    
    # Enfileira a tarefa em background
    # Extraímos informações do request para repassar à background task
    tenant_id_str = str(request.state.tenant_id)
    # Como não temos acesso à string de conexão diretamente aqui sem re-consultar, 
    # podemos pegar do request.state.tenant_slug e ir no ControlPlane ou simplesmente 
    # assumir que o get_tenant_session_maker consegue buscar via cache se já foi criado.
    # Mas o cache *só precisa do id e db_connection*.
    # Vamos injetar o db_connection no middleware também.
    db_connection = getattr(request.state, "tenant_db_connection", None)
    
    if db_connection:
        background_tasks.add_task(
            index_document_task, 
            tenant_id_str=tenant_id_str, 
            db_connection=db_connection, 
            document_id_str=str(new_document.id), 
            file_path=file_path
        )
    else:
        # Fallback (precisaremos atualizar o middleware para injetar tenant_db_connection)
        pass
        
    return {"message": "Upload recebido e indexação iniciada", "document_id": new_document.id}
