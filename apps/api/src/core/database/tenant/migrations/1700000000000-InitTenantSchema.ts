import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTenantSchema1700000000000 implements MigrationInterface {
  name = 'InitTenantSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── Extensions ────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    // ─── Enums ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`CREATE TYPE user_sso_provider_enum AS ENUM ('google','microsoft','local')`);
    await queryRunner.query(`CREATE TYPE audit_actor_type_enum AS ENUM ('user','system','ai','webhook')`);
    await queryRunner.query(`CREATE TYPE ticket_status_enum AS ENUM ('new','open','in_progress','pending','resolved','closed','cancelled')`);
    await queryRunner.query(`CREATE TYPE ticket_priority_enum AS ENUM ('critical','high','medium','low')`);
    await queryRunner.query(`CREATE TYPE ticket_source_enum AS ENUM ('portal','email','chat','api','ai','technician')`);
    await queryRunner.query(`CREATE TYPE chat_session_status_enum AS ENUM ('waiting','active','finished','escalated','abandoned')`);
    await queryRunner.query(`CREATE TYPE chat_sender_type_enum AS ENUM ('user','agent','ai','system')`);
    await queryRunner.query(`CREATE TYPE chat_channel_type_enum AS ENUM ('general','team','direct')`);
    await queryRunner.query(`CREATE TYPE kb_article_status_enum AS ENUM ('draft','pending_review','published','archived')`);
    await queryRunner.query(`CREATE TYPE ai_conversation_type_enum AS ENUM ('search','ticket_creation','copilot','general')`);
    await queryRunner.query(`CREATE TYPE ai_conversation_status_enum AS ENUM ('active','completed','handed_off','failed')`);
    await queryRunner.query(`CREATE TYPE ai_message_role_enum AS ENUM ('user','assistant','system')`);
    await queryRunner.query(`CREATE TYPE notification_type_enum AS ENUM ('ticket_assigned','ticket_updated','ticket_comment','chat_message','sla_breach','mention','system')`);
    await queryRunner.query(`CREATE TYPE email_status_enum AS ENUM ('pending','sent','failed','bounced')`);
    await queryRunner.query(`CREATE TYPE automation_trigger_type_enum AS ENUM ('ticket_created','ticket_updated','ticket_status_changed','sla_breached','time_elapsed','chat_created')`);
    await queryRunner.query(`CREATE TYPE automation_log_status_enum AS ENUM ('success','failed','skipped')`);
    await queryRunner.query(`CREATE TYPE webhook_delivery_status_enum AS ENUM ('pending','delivered','failed','cancelled')`);
    await queryRunner.query(`CREATE TYPE service_request_status_enum AS ENUM ('pending_approval','approved','rejected','in_progress','fulfilled','cancelled')`);
    await queryRunner.query(`CREATE TYPE form_field_type_enum AS ENUM ('text','textarea','select','multiselect','date','number','file','checkbox')`);

    // ─── Roles ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text,
        "is_system" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    // ─── Permissions ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" varchar(100) NOT NULL,
        "description" text,
        "module" varchar(50) NOT NULL,
        CONSTRAINT "UQ_permissions_code" UNIQUE ("code"),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    // ─── Users ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "avatar_url" text,
        "password_hash" text,
        "role_id" uuid,
        "department" varchar(255),
        "phone" varchar(50),
        "is_active" boolean NOT NULL DEFAULT true,
        "sso_subject" varchar(500),
        "sso_provider" user_sso_provider_enum NOT NULL DEFAULT 'local',
        "last_login_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL
      )
    `);

    // ─── Module Config ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "module_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "module" varchar(50) NOT NULL,
        "is_enabled" boolean NOT NULL DEFAULT true,
        "config" jsonb NOT NULL DEFAULT '{}',
        CONSTRAINT "UQ_module_config_module" UNIQUE ("module"),
        CONSTRAINT "PK_module_config" PRIMARY KEY ("id")
      )
    `);

    // ─── Business Hours ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "business_hours" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL DEFAULT 'Default',
        "timezone" varchar(50) NOT NULL DEFAULT 'America/Sao_Paulo',
        "is_default" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_business_hours" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "business_hours_slots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_hours_id" uuid NOT NULL,
        "day_of_week" smallint NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_business_hours_slots" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bh_slots_bh" FOREIGN KEY ("business_hours_id") REFERENCES "business_hours"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "holidays" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_hours_id" uuid NOT NULL,
        "date" date NOT NULL,
        "name" varchar(255) NOT NULL,
        "is_recurring" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_holidays" PRIMARY KEY ("id"),
        CONSTRAINT "FK_holidays_bh" FOREIGN KEY ("business_hours_id") REFERENCES "business_hours"("id") ON DELETE CASCADE
      )
    `);

    // ─── Teams ───────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "lead_id" uuid,
        "business_hours_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "FK_teams_lead" FOREIGN KEY ("lead_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_teams_bh" FOREIGN KEY ("business_hours_id") REFERENCES "business_hours"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "team_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "is_lead" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_team_members" PRIMARY KEY ("team_id","user_id"),
        CONSTRAINT "FK_team_members_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // ─── SLA ─────────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "sla_policies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text,
        "is_default" boolean NOT NULL DEFAULT false,
        "business_hours_id" uuid,
        CONSTRAINT "PK_sla_policies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sla_policies_bh" FOREIGN KEY ("business_hours_id") REFERENCES "business_hours"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sla_targets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "policy_id" uuid NOT NULL,
        "priority" ticket_priority_enum NOT NULL,
        "first_response_minutes" int NOT NULL,
        "resolution_minutes" int NOT NULL,
        "escalation_l1_minutes" int,
        "escalation_l2_minutes" int,
        CONSTRAINT "PK_sla_targets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sla_targets_policy" FOREIGN KEY ("policy_id") REFERENCES "sla_policies"("id") ON DELETE CASCADE
      )
    `);

    // ─── Ticket Categories and Types ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "ticket_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "parent_id" uuid,
        "icon" varchar(100),
        "color" varchar(7),
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_ticket_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "code" varchar(50) NOT NULL,
        CONSTRAINT "UQ_ticket_types_code" UNIQUE ("code"),
        CONSTRAINT "PK_ticket_types" PRIMARY KEY ("id")
      )
    `);

    // ─── Tickets ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS tickets_number_seq START 1;
      CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "number" int NOT NULL DEFAULT nextval('tickets_number_seq'),
        "title" varchar(500) NOT NULL,
        "description" text,
        "type_id" uuid,
        "status" ticket_status_enum NOT NULL DEFAULT 'new',
        "priority" ticket_priority_enum NOT NULL DEFAULT 'medium',
        "ai_category_id" uuid,
        "ai_category_confidence" float,
        "resolution_category_id" uuid,
        "requester_id" uuid NOT NULL,
        "assignee_id" uuid,
        "team_id" uuid,
        "sla_policy_id" uuid,
        "sla_first_response_due_at" timestamptz,
        "sla_resolution_due_at" timestamptz,
        "sla_first_response_met" boolean,
        "sla_resolution_met" boolean,
        "sla_paused_at" timestamptz,
        "sla_paused_duration_minutes" int NOT NULL DEFAULT 0,
        "parent_ticket_id" uuid,
        "source" ticket_source_enum NOT NULL DEFAULT 'portal',
        "external_id" varchar(255),
        "external_source" varchar(100),
        "closed_at" timestamptz,
        "resolved_at" timestamptz,
        "csat_score" smallint CHECK ("csat_score" BETWEEN 1 AND 5),
        "csat_comment" text,
        "csat_requested_at" timestamptz,
        "csat_submitted_at" timestamptz,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tickets_number" UNIQUE ("number"),
        CONSTRAINT "FK_tickets_type" FOREIGN KEY ("type_id") REFERENCES "ticket_types"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_ai_category" FOREIGN KEY ("ai_category_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_resolution_category" FOREIGN KEY ("resolution_category_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_tickets_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_sla" FOREIGN KEY ("sla_policy_id") REFERENCES "sla_policies"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_parent" FOREIGN KEY ("parent_ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tickets_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_tickets_status" ON "tickets"("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_assignee" ON "tickets"("assignee_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_requester" ON "tickets"("requester_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_sla_response_due" ON "tickets"("sla_first_response_due_at") WHERE "status" NOT IN ('resolved','closed','cancelled')`);
    await queryRunner.query(`CREATE INDEX "IDX_tickets_sla_resolution_due" ON "tickets"("sla_resolution_due_at") WHERE "status" NOT IN ('resolved','closed','cancelled')`);

    await queryRunner.query(`
      CREATE TABLE "ticket_comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "body" text NOT NULL,
        "is_internal" boolean NOT NULL DEFAULT false,
        "is_ai_generated" boolean NOT NULL DEFAULT false,
        "parent_comment_id" uuid,
        "edited_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_comments_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_ticket_comments_parent" FOREIGN KEY ("parent_comment_id") REFERENCES "ticket_comments"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid,
        "comment_id" uuid,
        "uploader_id" uuid NOT NULL,
        "filename" varchar(255) NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "size_bytes" bigint NOT NULL,
        "storage_path" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_attachments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_attachments_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_attachments_comment" FOREIGN KEY ("comment_id") REFERENCES "ticket_comments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_attachments_uploader" FOREIGN KEY ("uploader_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid NOT NULL,
        "changed_by_id" uuid NOT NULL,
        "field_name" varchar(100) NOT NULL,
        "old_value" text,
        "new_value" text,
        "changed_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_history_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_watchers" (
        "ticket_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_ticket_watchers" PRIMARY KEY ("ticket_id","user_id"),
        CONSTRAINT "FK_ticket_watchers_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_watchers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_tags" (
        "ticket_id" uuid NOT NULL,
        "tag" varchar(100) NOT NULL,
        CONSTRAINT "PK_ticket_tags" PRIMARY KEY ("ticket_id","tag"),
        CONSTRAINT "FK_ticket_tags_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_form_fields" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category_id" uuid NOT NULL,
        "label" varchar(255) NOT NULL,
        "field_type" form_field_type_enum NOT NULL DEFAULT 'text',
        "options" jsonb,
        "is_required" boolean NOT NULL DEFAULT false,
        "sort_order" int NOT NULL DEFAULT 0,
        "validation_rules" jsonb,
        CONSTRAINT "PK_ticket_form_fields" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_form_fields_category" FOREIGN KEY ("category_id") REFERENCES "ticket_categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ticket_field_values" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid NOT NULL,
        "field_id" uuid NOT NULL,
        "value" text,
        CONSTRAINT "PK_ticket_field_values" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_field_values_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ticket_field_values_field" FOREIGN KEY ("field_id") REFERENCES "ticket_form_fields"("id") ON DELETE CASCADE
      )
    `);

    // ─── Chat External ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "chat_queues" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "max_concurrent_chats_per_agent" int NOT NULL DEFAULT 5,
        "auto_assign" boolean NOT NULL DEFAULT true,
        "welcome_message" text,
        "offline_message" text,
        "business_hours_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" int NOT NULL DEFAULT 0,
        CONSTRAINT "PK_chat_queues" PRIMARY KEY ("id"),
        CONSTRAINT "FK_chat_queues_bh" FOREIGN KEY ("business_hours_id") REFERENCES "business_hours"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_queue_agents" (
        "queue_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_chat_queue_agents" PRIMARY KEY ("queue_id","user_id"),
        CONSTRAINT "FK_cqa_queue" FOREIGN KEY ("queue_id") REFERENCES "chat_queues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cqa_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "queue_id" uuid NOT NULL,
        "requester_id" uuid,
        "agent_id" uuid,
        "status" chat_session_status_enum NOT NULL DEFAULT 'waiting',
        "heartbeat_interval_seconds" int NOT NULL DEFAULT 30,
        "heartbeat_tolerance_seconds" int NOT NULL DEFAULT 90,
        "last_heartbeat_at" timestamptz,
        "ai_handled" boolean NOT NULL DEFAULT false,
        "ai_handoff_reason" text,
        "queue_wait_start_at" timestamptz NOT NULL DEFAULT now(),
        "agent_joined_at" timestamptz,
        "finished_at" timestamptz,
        "ticket_id" uuid,
        "ai_category_id" uuid,
        "resolution_category_id" uuid,
        "csat_score" smallint,
        "csat_comment" text,
        "escalated_to_user_id" uuid,
        "escalation_reason" text,
        "escalated_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cs_queue" FOREIGN KEY ("queue_id") REFERENCES "chat_queues"("id"),
        CONSTRAINT "FK_cs_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cs_agent" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cs_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_chat_sessions_status" ON "chat_sessions"("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_chat_sessions_heartbeat" ON "chat_sessions"("last_heartbeat_at") WHERE "status" = 'active'`);

    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "sender_id" uuid,
        "sender_type" chat_sender_type_enum NOT NULL,
        "body" text NOT NULL,
        "attachments" jsonb,
        "is_edited" boolean NOT NULL DEFAULT false,
        "edited_at" timestamptz,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" timestamptz,
        "is_ai_suggestion" boolean NOT NULL DEFAULT false,
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cm_session" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cm_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ─── Chat Internal ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "chat_channels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "type" chat_channel_type_enum NOT NULL DEFAULT 'general',
        "team_id" uuid,
        "is_archived" boolean NOT NULL DEFAULT false,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_channels" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cc_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_cc_creator" FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chat_channel_members" (
        "channel_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar(20) NOT NULL DEFAULT 'member',
        "joined_at" timestamptz NOT NULL DEFAULT now(),
        "last_read_at" timestamptz,
        CONSTRAINT "PK_chat_channel_members" PRIMARY KEY ("channel_id","user_id"),
        CONSTRAINT "FK_ccm_channel" FOREIGN KEY ("channel_id") REFERENCES "chat_channels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ccm_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "internal_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channel_id" uuid,
        "dm_id" uuid,
        "thread_parent_id" uuid,
        "sender_id" uuid NOT NULL,
        "body" text NOT NULL,
        "attachments" jsonb,
        "mentions" uuid[] NOT NULL DEFAULT '{}',
        "is_edited" boolean NOT NULL DEFAULT false,
        "edited_at" timestamptz,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" timestamptz,
        "reactions" jsonb NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internal_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_im_channel" FOREIGN KEY ("channel_id") REFERENCES "chat_channels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_im_parent" FOREIGN KEY ("thread_parent_id") REFERENCES "internal_messages"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_im_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id")
      )
    `);

    // ─── Knowledge Base ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "kb_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "description" text,
        "parent_id" uuid,
        "icon" varchar(100),
        "color" varchar(7),
        "sort_order" int NOT NULL DEFAULT 0,
        "is_public" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_kb_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_kb_categories" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kbc_parent" FOREIGN KEY ("parent_id") REFERENCES "kb_categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "kb_articles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category_id" uuid NOT NULL,
        "title" varchar(500) NOT NULL,
        "slug" varchar(500) NOT NULL,
        "content" text NOT NULL DEFAULT '',
        "content_vector" tsvector,
        "excerpt" text,
        "status" kb_article_status_enum NOT NULL DEFAULT 'draft',
        "is_public" boolean NOT NULL DEFAULT true,
        "author_id" uuid NOT NULL,
        "reviewer_id" uuid,
        "submitted_for_review_at" timestamptz,
        "reviewed_at" timestamptz,
        "review_notes" text,
        "published_at" timestamptz,
        "views" int NOT NULL DEFAULT 0,
        "helpful_votes" int NOT NULL DEFAULT 0,
        "unhelpful_votes" int NOT NULL DEFAULT 0,
        "embedding_updated_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_kb_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_kb_articles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kba_category" FOREIGN KEY ("category_id") REFERENCES "kb_categories"("id"),
        CONSTRAINT "FK_kba_author" FOREIGN KEY ("author_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_kba_reviewer" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_kb_articles_content_fts" ON "kb_articles" USING GIN("content_vector")`);
    await queryRunner.query(`CREATE INDEX "IDX_kb_articles_status" ON "kb_articles"("status")`);

    await queryRunner.query(`
      CREATE TABLE "kb_article_versions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "article_id" uuid NOT NULL,
        "version_number" int NOT NULL,
        "title" varchar(500) NOT NULL,
        "content" text NOT NULL,
        "changed_by_id" uuid NOT NULL,
        "change_summary" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_kb_article_versions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_kbav_article" FOREIGN KEY ("article_id") REFERENCES "kb_articles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_kb_embeddings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "article_id" uuid NOT NULL,
        "chunk_index" int NOT NULL,
        "chunk_text" text NOT NULL,
        "embedding" vector(1536),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_kb_embeddings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ai_kb_embeddings" UNIQUE ("article_id","chunk_index"),
        CONSTRAINT "FK_kbe_article" FOREIGN KEY ("article_id") REFERENCES "kb_articles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_ai_kb_embeddings_vector" ON "ai_kb_embeddings" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`);

    // ─── Service Catalog ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "service_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "icon" varchar(100),
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_service_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "service_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "icon" varchar(100),
        "sla_policy_id" uuid,
        "auto_assign_team_id" uuid,
        "approval_required" boolean NOT NULL DEFAULT false,
        "approver_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_si_category" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id"),
        CONSTRAINT "FK_si_sla" FOREIGN KEY ("sla_policy_id") REFERENCES "sla_policies"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_si_team" FOREIGN KEY ("auto_assign_team_id") REFERENCES "teams"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_si_approver" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "service_item_fields" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_item_id" uuid NOT NULL,
        "label" varchar(255) NOT NULL,
        "field_type" form_field_type_enum NOT NULL DEFAULT 'text',
        "options" jsonb,
        "is_required" boolean NOT NULL DEFAULT false,
        "sort_order" int NOT NULL DEFAULT 0,
        CONSTRAINT "PK_service_item_fields" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sif_item" FOREIGN KEY ("service_item_id") REFERENCES "service_items"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "service_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_item_id" uuid NOT NULL,
        "ticket_id" uuid NOT NULL,
        "requester_id" uuid NOT NULL,
        "status" service_request_status_enum NOT NULL DEFAULT 'pending_approval',
        "approver_id" uuid,
        "approved_at" timestamptz,
        "rejection_reason" text,
        "field_values" jsonb NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_requests" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sr_item" FOREIGN KEY ("service_item_id") REFERENCES "service_items"("id"),
        CONSTRAINT "FK_sr_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id"),
        CONSTRAINT "FK_sr_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_sr_approver" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // ─── AI Conversations ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "ai_conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "session_id" uuid,
        "ticket_id" uuid,
        "type" ai_conversation_type_enum NOT NULL DEFAULT 'general',
        "status" ai_conversation_status_enum NOT NULL DEFAULT 'active',
        "handoff_reason" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_conversations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_aic_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_aic_session" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_aic_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "role" ai_message_role_enum NOT NULL,
        "content" text NOT NULL,
        "raw_content" text,
        "input_tokens" int NOT NULL DEFAULT 0,
        "output_tokens" int NOT NULL DEFAULT 0,
        "model" varchar(100),
        "latency_ms" int,
        "was_fallback" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_aim_conversation" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_token_usage_monthly" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "year" int NOT NULL,
        "month" int NOT NULL,
        "input_tokens" bigint NOT NULL DEFAULT 0,
        "output_tokens" bigint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_ai_token_usage_monthly" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_ai_token_usage_period" UNIQUE ("year","month")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "ai_conversation_audit" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "user_id" uuid,
        "full_transcript" jsonb NOT NULL DEFAULT '[]',
        "prompt_injections_detected" boolean NOT NULL DEFAULT false,
        "injection_details" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_conversation_audit" PRIMARY KEY ("id"),
        CONSTRAINT "FK_aica_conversation" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE
      )
    `);

    // ─── Automation ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "automation_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "trigger_type" automation_trigger_type_enum NOT NULL,
        "trigger_conditions" jsonb NOT NULL DEFAULT '[]',
        "actions" jsonb NOT NULL DEFAULT '[]',
        "run_count" int NOT NULL DEFAULT 0,
        "last_run_at" timestamptz,
        "created_by_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_automation_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ar_creator" FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "automation_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rule_id" uuid NOT NULL,
        "trigger_entity_type" varchar(50) NOT NULL,
        "trigger_entity_id" uuid NOT NULL,
        "status" automation_log_status_enum NOT NULL,
        "actions_executed" jsonb NOT NULL DEFAULT '[]',
        "error_message" text,
        "executed_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_automation_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_al_rule" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE
      )
    `);

    // ─── Webhooks ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "webhook_endpoints" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "url" text NOT NULL,
        "secret" varchar(255) NOT NULL,
        "events" text[] NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "retry_count" int NOT NULL DEFAULT 3,
        "timeout_seconds" int NOT NULL DEFAULT 30,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_endpoints" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhook_deliveries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "endpoint_id" uuid NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL DEFAULT '{}',
        "response_status" int,
        "response_body" text,
        "attempt_count" int NOT NULL DEFAULT 1,
        "next_retry_at" timestamptz,
        "status" webhook_delivery_status_enum NOT NULL DEFAULT 'pending',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_deliveries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wd_endpoint" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "webhook_inbound_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "source" varchar(100) NOT NULL,
        "external_id" varchar(255),
        "event_type" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL DEFAULT '{}',
        "processed" boolean NOT NULL DEFAULT false,
        "ticket_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_inbound_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wil_ticket" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL
      )
    `);

    // ─── Notifications ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" notification_type_enum NOT NULL,
        "title" varchar(255) NOT NULL,
        "body" text NOT NULL,
        "data" jsonb NOT NULL DEFAULT '{}',
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notif_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_unread" ON "notifications"("user_id") WHERE "read_at" IS NULL`);

    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" varchar(100) NOT NULL,
        "in_app" boolean NOT NULL DEFAULT true,
        "email" boolean NOT NULL DEFAULT true,
        "sound" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notif_prefs" UNIQUE ("user_id","type"),
        CONSTRAINT "FK_np_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "email_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "to_email" varchar(255) NOT NULL,
        "subject" varchar(500) NOT NULL,
        "template" varchar(100) NOT NULL,
        "data" jsonb NOT NULL DEFAULT '{}',
        "status" email_status_enum NOT NULL DEFAULT 'pending',
        "sent_at" timestamptz,
        "error_message" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_log" PRIMARY KEY ("id")
      )
    `);

    // ─── Audit Logs (NEVER deleted) ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actor_id" uuid,
        "actor_type" audit_actor_type_enum NOT NULL,
        "actor_email" varchar(255),
        "action" varchar(100) NOT NULL,
        "entity_type" varchar(50) NOT NULL,
        "entity_id" uuid,
        "entity_display_name" varchar(500),
        "before_state" jsonb,
        "after_state" jsonb,
        "ip_address" inet,
        "user_agent" text,
        "metadata" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs"("entity_type","entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_actor" ON "audit_logs"("actor_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs"("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs"("created_at")`);

    // ─── Seed default data ────────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "permissions" ("code", "description", "module") VALUES
        ('tickets.view', 'View tickets', 'tickets'),
        ('tickets.create', 'Create tickets', 'tickets'),
        ('tickets.update', 'Update tickets', 'tickets'),
        ('tickets.delete', 'Delete tickets', 'tickets'),
        ('tickets.assign', 'Assign tickets', 'tickets'),
        ('tickets.close', 'Close/resolve tickets', 'tickets'),
        ('chat.view', 'View chat sessions', 'chat'),
        ('chat.attend', 'Attend chat sessions', 'chat'),
        ('chat.manage', 'Manage chat queues', 'chat'),
        ('kb.view', 'View knowledge base', 'kb'),
        ('kb.write', 'Create/edit KB articles', 'kb'),
        ('kb.publish', 'Publish/approve KB articles', 'kb'),
        ('catalog.view', 'View service catalog', 'catalog'),
        ('catalog.request', 'Make service requests', 'catalog'),
        ('catalog.manage', 'Manage service catalog', 'catalog'),
        ('automation.view', 'View automation rules', 'automation'),
        ('automation.manage', 'Manage automation rules', 'automation'),
        ('reports.view', 'View reports', 'reports'),
        ('admin.users', 'Manage users', 'admin'),
        ('admin.roles', 'Manage roles and permissions', 'admin'),
        ('admin.settings', 'Manage tenant settings', 'admin'),
        ('admin.sla', 'Manage SLA policies', 'admin'),
        ('admin.webhooks', 'Manage webhooks', 'admin')
    `);

    // Default roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description", "is_system") VALUES
        ('Administrator', 'Full access to all modules', true),
        ('Technician', 'Handle tickets and chat sessions', true),
        ('End User', 'Submit tickets and use service catalog', true),
        ('Manager', 'View reports and manage team settings', true)
    `);

    // Grant all permissions to Administrator
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id FROM "roles" r, "permissions" p WHERE r.name = 'Administrator'
    `);

    // Grant core permissions to Technician
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id FROM "roles" r, "permissions" p
      WHERE r.name = 'Technician'
        AND p.code IN ('tickets.view','tickets.create','tickets.update','tickets.assign','tickets.close','chat.view','chat.attend','kb.view','kb.write','catalog.view','reports.view')
    `);

    // Grant basic permissions to End User
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id FROM "roles" r, "permissions" p
      WHERE r.name = 'End User'
        AND p.code IN ('tickets.view','tickets.create','kb.view','catalog.view','catalog.request')
    `);

    // Grant Manager permissions
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id FROM "roles" r, "permissions" p
      WHERE r.name = 'Manager'
        AND p.code IN ('tickets.view','tickets.update','tickets.assign','tickets.close','chat.view','chat.manage','kb.view','kb.write','kb.publish','catalog.view','catalog.manage','automation.view','automation.manage','reports.view','admin.users','admin.sla')
    `);

    // Default business hours (Mon–Fri 8h–18h, Sao Paulo)
    await queryRunner.query(`
      INSERT INTO "business_hours" ("name", "timezone", "is_default") VALUES ('Horário Comercial', 'America/Sao_Paulo', true)
    `);

    await queryRunner.query(`
      INSERT INTO "business_hours_slots" ("business_hours_id","day_of_week","start_time","end_time")
      SELECT id, day, '08:00', '18:00'
      FROM "business_hours", generate_series(1,5) AS day
      WHERE "is_default" = true
    `);

    // Default SLA policy
    await queryRunner.query(`
      INSERT INTO "sla_policies" ("name","description","is_default","business_hours_id")
      SELECT 'SLA Padrão','Política SLA padrão do tenant',true,id FROM "business_hours" WHERE "is_default"=true
    `);

    await queryRunner.query(`
      INSERT INTO "sla_targets" ("policy_id","priority","first_response_minutes","resolution_minutes","escalation_l1_minutes","escalation_l2_minutes")
      SELECT id,'critical'::ticket_priority_enum,15,240,120,180 FROM "sla_policies" WHERE "is_default"=true
      UNION ALL
      SELECT id,'high'::ticket_priority_enum,60,480,240,360 FROM "sla_policies" WHERE "is_default"=true
      UNION ALL
      SELECT id,'medium'::ticket_priority_enum,240,1440,720,1080 FROM "sla_policies" WHERE "is_default"=true
      UNION ALL
      SELECT id,'low'::ticket_priority_enum,480,4320,2880,4320 FROM "sla_policies" WHERE "is_default"=true
    `);

    // Default ticket types
    await queryRunner.query(`
      INSERT INTO "ticket_types" ("name","code") VALUES
        ('Incidente','incident'),
        ('Requisição de Serviço','service_request'),
        ('Problema','problem'),
        ('Mudança','change')
    `);

    // Default module config
    await queryRunner.query(`
      INSERT INTO "module_config" ("module","is_enabled") VALUES
        ('tickets',true),('chat',true),('kb',true),('catalog',true),
        ('automation',true),('reports',true),('chat_internal',true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    const tables = [
      'ai_conversation_audit','ai_messages','ai_conversations','ai_kb_embeddings',
      'ai_token_usage_monthly','automation_logs','automation_rules',
      'webhook_inbound_logs','webhook_deliveries','webhook_endpoints',
      'notification_preferences','notifications','email_log',
      'audit_logs','service_requests','service_item_fields','service_items',
      'service_categories','kb_article_versions','kb_articles','kb_categories',
      'internal_messages','chat_channel_members','chat_channels',
      'chat_messages','chat_sessions','chat_queue_agents','chat_queues',
      'ticket_field_values','ticket_form_fields','ticket_tags','ticket_watchers',
      'ticket_history','ticket_attachments','ticket_comments','tickets',
      'ticket_types','ticket_categories','sla_targets','sla_policies',
      'team_members','teams','holidays','business_hours_slots','business_hours',
      'module_config','role_permissions','permissions','users','roles',
    ];
    for (const t of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }
  }
}
