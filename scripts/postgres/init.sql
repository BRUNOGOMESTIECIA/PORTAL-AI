-- PostgreSQL initialization script
-- Runs once when container is first created

-- Enable pgvector extension for AI embeddings (on master and future tenant DBs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Note: pgvector extension is created per-tenant DB when provisioned
-- CREATE EXTENSION IF NOT EXISTS "vector";
