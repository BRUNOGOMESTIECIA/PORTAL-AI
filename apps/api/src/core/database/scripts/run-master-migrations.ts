import { DataSource } from 'typeorm';
import { InitMasterSchema1700000000000 } from '../master/migrations/1700000000000-InitMasterSchema';

/**
 * SCRIPT DE EXECUÇÃO DE MIGRATIONS DE MASTER (BANCO GLOBAL)
 */
async function runMasterMigrations() {
  console.log('[Migrations Master] Conectando ao Banco de Dados PostgreSQL...');

  const host = process.env.MASTER_DB_HOST || 'localhost';
  const port = parseInt(process.env.MASTER_DB_PORT || '5432', 10);
  const username = process.env.MASTER_DB_USER || 'postgres';
  const password = process.env.MASTER_DB_PASSWORD || 'postgres';
  const database = process.env.MASTER_DB_NAME || 'portal_master';

  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    migrations: [InitMasterSchema1700000000000],
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log(`[Migrations Master] Conectado com sucesso à base ${database}. Rodando migrations...`);
    await dataSource.runMigrations();
    console.log('[Migrations Master] ✅ Migrations SQL aplicadas com sucesso!');
  } catch (err: any) {
    console.error('[Migrations Master] ❌ Falha ao aplicar migrations:', err.message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runMasterMigrations();
