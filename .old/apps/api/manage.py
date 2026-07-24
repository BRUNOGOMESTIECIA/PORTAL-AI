import argparse
import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.saas_portal.database.models import Tenant

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password@localhost:5433/saas_portal"
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_tenant(slug: str, name: str, db_connection: str):
    async with AsyncSessionLocal() as session:
        # Verifica se já existe
        # Aqui usaríamos uma query real: result = await session.execute(select(Tenant).where(Tenant.slug == slug))
        # Mas simplificando para o MVP da Fase 0
        new_tenant = Tenant(
            slug=slug,
            name=name,
            db_connection=db_connection,
            status="active"
        )
        session.add(new_tenant)
        await session.commit()
        print(f"Tenant '{name}' (slug: {slug}) provisionado com sucesso!")
        print(f"Tenant ID: {new_tenant.id}")

import subprocess
from sqlalchemy.future import select

async def migrate_tenants():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Tenant))
        tenants = result.scalars().all()
        
        for tenant in tenants:
            print(f"Rodando migrations para o tenant: {tenant.name} ({tenant.slug})")
            
            # Precisamos converter postgresql+asyncpg para postgresql para comandos síncronos se necessário,
            # mas o env.py usa a async engine, então mantemos a mesma string
            env = os.environ.copy()
            env["TENANT_DATABASE_URL"] = tenant.db_connection
            
            # Roda o alembic para o tenant
            # uv run alembic -c alembic_tenant.ini upgrade head
            try:
                subprocess.run(
                    ["C:\\Users\\suporte\\.local\\bin\\uv.exe", "run", "alembic", "-c", "alembic_tenant.ini", "upgrade", "head"],
                    env=env,
                    check=True
                )
                print(f"✅ Migrations aplicadas com sucesso em {tenant.slug}\n")
            except subprocess.CalledProcessError as e:
                print(f"❌ Erro ao rodar migrations em {tenant.slug}: {e}\n")

def main():
    parser = argparse.ArgumentParser(description="Admin CLI for SaaS Portal")
    subparsers = parser.add_subparsers(dest="command")

    create_tenant_parser = subparsers.add_parser("create-tenant")
    create_tenant_parser.add_argument("--slug", required=True, help="O slug do tenant (ex: acme)")
    create_tenant_parser.add_argument("--name", required=True, help="Nome do cliente")
    create_tenant_parser.add_argument("--db-connection", required=True, help="String de conexão do tenant DB")

    migrate_tenants_parser = subparsers.add_parser("migrate-tenants", help="Roda as migrations em todos os tenants")

    args = parser.parse_args()

    if args.command == "create-tenant":
        asyncio.run(create_tenant(args.slug, args.name, args.db_connection))
    elif args.command == "migrate-tenants":
        asyncio.run(migrate_tenants())
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
