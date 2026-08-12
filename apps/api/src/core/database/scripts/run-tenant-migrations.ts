import { DataSource } from 'typeorm';
import { InitTenantSchema1700000000000 } from '../tenant/migrations/1700000000000-InitTenantSchema';

/**
 * SCRIPT DE EXECUÇÃO DE MIGRATIONS DE TENANT (BANCO OPERACIONAL)
 */
async function runTenantMigrations() {
  console.log('[Migrations Tenant] Conectando ao Banco de Dados PostgreSQL...');

  const host = process.env.MASTER_DB_HOST || 'localhost';
  const port = parseInt(process.env.MASTER_DB_PORT || '5432', 10);
  const username = process.env.MASTER_DB_USER || 'postgres';
  const password = process.env.MASTER_DB_PASSWORD || 'postgres';
  const database = process.env.MASTER_DB_NAME || 'portal_tenant_clienteabc';

  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    migrations: [InitTenantSchema1700000000000],
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log(`[Migrations Tenant] Conectado com sucesso à base ${database}. Rodando migrations...`);
    await dataSource.runMigrations();
    console.log('[Migrations Tenant] ✅ Migrations SQL aplicadas com sucesso!');
  } catch (err: any) {
    console.error('[Migrations Tenant] ❌ Falha ao aplicar migrations:', err.message);
    console.info('DICA: Garanta que o serviço PostgreSQL esteja ativo na máquina local (porta 5432).');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runTenantMigrations();
