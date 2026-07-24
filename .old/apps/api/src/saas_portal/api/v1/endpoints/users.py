from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid

from src.saas_portal.database.session import get_db_session
from src.saas_portal.database.models import User

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: str
    role: str = "Atendente"

@router.get("")
@router.get("/")
async def list_users(
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant não resolvido")

    result = await db.execute(select(User).filter(User.tenant_id == tenant_id).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    # Adicionando um status mock para o frontend
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": "Ativo"
        }
        for u in users
    ]

@router.post("")
@router.post("/")
async def create_user(
    user_in: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant não resolvido")
        
    new_user = User(
        tenant_id=tenant_id,
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        hashed_password="mock_password" 
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": new_user.id, "name": new_user.name}

@router.put("/{user_id}")
@router.put("/{user_id}/")
async def update_user(
    user_id: uuid.UUID,
    user_in: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    tenant_id = getattr(request.state, "tenant_id", None)
    
    result = await db.execute(select(User).filter(User.id == user_id, User.tenant_id == tenant_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.name = user_in.name
    user.email = user_in.email
    user.role = user_in.role
    
    await db.commit()
    return {"id": user.id, "message": "Atualizado com sucesso"}

@router.delete("/{user_id}")
@router.delete("/{user_id}/")
async def delete_user(
    user_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    tenant_id = getattr(request.state, "tenant_id", None)
    
    result = await db.execute(select(User).filter(User.id == user_id, User.tenant_id == tenant_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    await db.delete(user)
    await db.commit()
    return {"status": "success"}

