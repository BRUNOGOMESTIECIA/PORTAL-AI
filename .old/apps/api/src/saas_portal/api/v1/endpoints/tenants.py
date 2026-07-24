from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import uuid
import os

from src.saas_portal.database.session import get_db_session
from src.saas_portal.database.models import Tenant
from src.saas_portal.database.tenant_session import create_tenant_database

router = APIRouter()

class TenantCreate(BaseModel):
    name: str
    slug: str

@router.get("")
@router.get("/")
async def list_tenants(
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(Tenant).order_by(Tenant.created_at.desc()))
    tenants = result.scalars().all()
    
    return [
        {
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "status": t.status,
            "created_at": t.created_at
        }
        for t in tenants
    ]

@router.post("")
@router.post("/")
async def create_tenant(
    tenant_in: TenantCreate,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    # Check if slug exists
    result = await db.execute(select(Tenant).filter(Tenant.slug == tenant_in.slug))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Slug já está em uso")
        
    db_filename = f"tenant_{tenant_in.slug}.db"
    db_path = os.path.join(os.getcwd(), "tenant_dbs", db_filename)
    db_connection = f"sqlite+aiosqlite:///{db_path}"

    new_tenant = Tenant(
        name=tenant_in.name,
        slug=tenant_in.slug,
        db_connection=db_connection,
        status="active"
    )
    db.add(new_tenant)
    await db.commit()
    await db.refresh(new_tenant)
    
    # Trigger the creation of the tenant SQLite database (create tables)
    await create_tenant_database(db_connection)
    
    return {
        "id": new_tenant.id, 
        "name": new_tenant.name, 
        "slug": new_tenant.slug
    }

@router.get("/users")
async def list_global_users(
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    from sqlalchemy.orm import selectinload
    from src.saas_portal.database.models import User
    
    result = await db.execute(select(User).options(selectinload(User.tenant)).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "tenant": {
                "id": u.tenant.id,
                "name": u.tenant.name,
                "slug": u.tenant.slug
            } if u.tenant else None
        }
        for u in users
    ]

@router.put("/{tenant_id}")
async def update_tenant(
    tenant_id: str,
    tenant_in: TenantCreate,
    db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(Tenant).filter(Tenant.id == tenant_id))
    tenant = result.scalars().first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    
    tenant.name = tenant_in.name
    # Normalmente não se altera o slug, mas vou permitir para o mockup
    tenant.slug = tenant_in.slug
    await db.commit()
    await db.refresh(tenant)
    return {"id": tenant.id, "name": tenant.name, "slug": tenant.slug, "status": tenant.status}

@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(Tenant).filter(Tenant.id == tenant_id))
    tenant = result.scalars().first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    
    tenant.status = "deleted"
    await db.commit()
    return {"detail": "Tenant deletado (soft delete)"}

class UserRoleUpdate(BaseModel):
    role: str

@router.put("/users/{user_id}")
async def update_global_user(
    user_id: str,
    user_in: UserRoleUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    from src.saas_portal.database.models import User
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.role = user_in.role
    await db.commit()
    return {"detail": "Role atualizada com sucesso"}

@router.delete("/users/{user_id}")
async def delete_global_user(
    user_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    from src.saas_portal.database.models import User
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    db.delete(user)
    await db.commit()
    return {"detail": "Usuário deletado"}
