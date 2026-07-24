import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMasterSchema1700000000000 implements MigrationInterface {
  name = 'InitMasterSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE tenant_status_enum AS ENUM ('active', 'suspended', 'trial', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE sso_provider_enum AS ENUM ('google', 'microsoft', 'none')
    `);
    await queryRunner.query(`
      CREATE TYPE platform_alert_type_enum AS ENUM ('ai_fallback', 'system_error', 'quota_exceeded')
    `);

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" varchar(63) NOT NULL,
        "name" varchar(255) NOT NULL,
        "status" tenant_status_enum NOT NULL DEFAULT 'trial',
        "db_name" varchar(255) NOT NULL,
        "db_user" varchar(255) NOT NULL,
        "db_password_encrypted" text NOT NULL,
        "sso_provider" sso_provider_enum NOT NULL DEFAULT 'none',
        "sso_config" jsonb,
        "sso_allowed_domains" text[] NOT NULL DEFAULT '{}',
        "ai_enabled" boolean NOT NULL DEFAULT true,
        "ai_model" varchar(100),
        "ai_token_limit_monthly" int,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_token_usage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "year" int NOT NULL,
        "month" int NOT NULL,
        "input_tokens" bigint NOT NULL DEFAULT 0,
        "output_tokens" bigint NOT NULL DEFAULT 0,
        "total_cost_usd" decimal(10,6) NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_token_usage" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ai_token_usage" UNIQUE ("tenant_id", "year", "month"),
        CONSTRAINT "FK_ai_token_usage_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "platform_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" platform_alert_type_enum NOT NULL,
        "tenant_id" uuid,
        "message" text NOT NULL,
        "resolved_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_platform_alerts_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_platform_alerts_resolved" ON "platform_alerts"("resolved_at") WHERE "resolved_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_ai_token_usage_tenant" ON "ai_token_usage"("tenant_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_alerts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_token_usage" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS platform_alert_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS sso_provider_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS tenant_status_enum`);
  }
}
