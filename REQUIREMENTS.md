# Portal ITSM — Requisitos e Regras de Negócio

## 1. Visão Geral

Plataforma SaaS multi-tenant de ITSM e Service Desk com isolamento database-per-tenant, IA (RAG + Copiloto), chat em tempo real, RBAC granular, SLA e trilha de auditoria onisciente.

---

## 2. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | NestJS 11 + TypeORM 0.3 |
| Frontend | Vite 5 + React 18 + TypeScript 5 |
| UI | shadcn/ui (Radix UI + Tailwind CSS) |
| Banco de Dados | PostgreSQL 16 + pgvector |
| Cache / Filas | Redis 7 (BullMQ + Socket.IO adapter) |
| Tempo Real | Socket.IO |
| Estado Cliente | TanStack Query v5 + Zustand |
| Armazenamento | MinIO (S3-compatível, local) |
| Container | Docker + Docker Compose |
| Proxy Reverso | Traefik v3 (wildcard SSL + roteamento por subdomínio) |
| Locale | UTC-3 fixo (America/Sao_Paulo), PT-BR |
| Monorepo | Turborepo (apps/api, apps/web, packages/shared) |

---

## 3. Arquitetura Multi-Tenant

### Modelo de Isolamento
- **Database-per-tenant**: cada tenant possui seu próprio banco PostgreSQL (`tenant_{slug}`)
- Um banco `portal_master` armazena o catálogo de tenants e configurações globais
- A mesma instância PostgreSQL hospeda todos os bancos
- Roteamento por **subdomínio** (ex: `acme.empresa.com.br` → slug `acme`)

### Fluxo de Resolução por Request
1. `TenantMiddleware` extrai subdomínio do header `Host`
2. Busca tenant em Redis (cache TTL 5min) — cache miss consulta `portal_master.tenants`
3. Recupera/cria TypeORM DataSource para o tenant (pool LRU, max 100 conexões)
4. Injeta `TenantContext` no escopo do request via `AsyncLocalStorage`

### Provisionamento de Novo Tenant
1. Admin cria tenant via painel → API gera credenciais → cria banco `tenant_{slug}`
2. Executa migrations TypeORM contra o novo banco
3. Seed: roles padrão (Admin, Técnico, Usuário Final, Gerente), 23 permissões, horário comercial (Seg-Sex 8h-18h), política SLA padrão, tipos de ticket
4. Registra no `portal_master` e invalida cache Redis

---

## 4. Autenticação e SSO

### JWT
- **Access token**: 15 minutos, httpOnly cookie
- **Refresh token**: 7 dias, httpOnly cookie
- Auto-refresh via interceptor Axios (fila de requisições durante refresh)
- JWT contém `tenantId` — validado em cada request

### SSO
- Provedores: **Google Workspace** (passport-google-oauth20) e **Microsoft Entra ID** (OIDC via openid-client)
- Configuração por tenant (`sso_config` JSONB com clientId, clientSecret, tenantId)
- **REGRA CRÍTICA**: após callback OAuth, valida domínio do e-mail contra `sso_allowed_domains`; e-mails fora do domínio são **rejeitados** e a sessão é destruída
- Login local (email/senha) também suportado

---

## 5. RBAC (Controle de Acesso Baseado em Roles)

### Roles Padrão (seed)
- **Administrator**: acesso total
- **Technician**: tickets, chat, KB (sem admin)
- **Manager**: tickets + relatórios
- **End User**: apenas portal do usuário final

### Permissões (códigos)
```
tickets.view, tickets.create, tickets.edit, tickets.close, tickets.delete, tickets.assign
chat.view, chat.manage, chat.respond
kb.view, kb.create, kb.edit, kb.publish, kb.delete
catalog.view, catalog.request
reports.view
admin.users, admin.roles, admin.settings, admin.tenants
audit.view
automation.manage
webhooks.manage
```

### Regras
- `PermissionGuard` verifica `user.role.permissions` (Set para lookup O(1))
- `PermissionGate` no frontend renderiza condicional por permissão
- Sidebar filtra itens de navegação por permissão do usuário logado

---

## 6. Tickets

### Status Flow
```
new → open → in_progress → pending → resolved → closed
                                    ↘ cancelled
```

### Prioridades
`critical` | `high` | `medium` | `low`

### Fontes (`source`)
`portal` | `email` | `chat` | `api` | `ai` | `technician`

### Regras de Negócio
- Técnico pode criar ticket **em nome do cliente** (campo `created_by_id` separado de `requester_id`) — sem personificação
- **Ticket filho**: `parent_ticket_id` FK NULLABLE
- **Watchers**: tabela `ticket_watchers` (notificados em atualizações)
- **Tags**: tabela `ticket_tags`
- **Campos customizados**: `ticket_form_fields` por categoria + `ticket_field_values` por ticket
- **Dupla categorização IA**: `ai_category_id` (gerado pela IA, **oculto ao usuário**) + `resolution_category_id` (editável pelo técnico no modal de fechamento)
- **External ID**: `external_id` + `external_source` para integração com sistemas externos via webhook
- **CSAT**: enviado após fechamento, score 1-5 + comentário

### SLA
- Política SLA configurável por tenant
- Campos: `sla_first_response_due_at`, `sla_resolution_due_at`
- **Pausa**: quando status → `pending`, `sla_paused_at` é registrado
- **Retomada**: ao sair de `pending`, `resumeSla()` estende due dates pela duração pausada usando `EXTRACT(EPOCH FROM (now() - sla_paused_at))`
- **Breach detection**: @Cron a cada minuto + BullMQ job com delay calculado na criação
- SLA breach dispara: notificação in-app + e-mail + automação
- `sla_first_response_met` e `sla_resolution_met` booleanos registrados ao fechar

---

## 7. Chat Externo (Suporte ao Cliente)

### Status das Sessões
`waiting` | `active` | `finished` | `escalated` | `abandoned`

### Regras
- **Filas** com config: `max_concurrent_chats_per_agent`, `auto_assign`, `welcome_message`, `offline_message`
- **Heartbeat**: cliente envia `chat:heartbeat` a cada `heartbeat_interval_seconds` (default 30s)
- Backend `@Cron` a cada 30s marca como `abandoned` se `now - last_heartbeat_at > heartbeat_tolerance_seconds` (default 90s)
- **Tolerância configurável por sessão** — evita falso abandono em oscilações de internet
- **Auto-colapso fora do horário**: frontend consulta `business_hours`, desabilita widget fora do horário
- **Escalação**: `escalated_to_user_id` + `escalation_reason` + `escalated_at`
### A Regra de Ouro: Todo Chat é um Ticket
- **Integração Absoluta**: Ao iniciar um chat (primeira mensagem do cliente), um **ticket é criado imediatamente** associado àquela sessão.
- **Aguardando (Waiting)**: O ticket e o chat nascem com o status `aguardando` (na fila).
- **Em Atendimento (Active)**: Quando o técnico assume o chat, o ticket muda automaticamente para o status `em atendimento`.
- **Resolução (Resolved/Finished)**: Se o técnico resolver o problema durante o chat, ao encerrar o chat, o ticket é marcado como `finalizado/resolvido`, recebendo todo o histórico (transcrição) e detalhes.
- **Escalonamento (Escalated)**: Se o técnico não puder resolver e precisar passar para outra mesa (N2/N3), o chat é `finalizado` para o cliente (encerra o tempo real), mas o **ticket permanece `aberto/em andamento`** e é transferido para a fila da outra mesa.
- O campo `ticket_id` (FK) na sessão de chat é obrigatório.
- **Copiloto IA**: sugestões com `is_ai_suggestion = true` — **nunca visíveis ao cliente**, apenas ao agente
- **Categorização dupla**: `ai_category_id` (automático) + `resolution_category_id` (no fechamento)
- **CSAT** enviado ao finalizar sessão

### Widget
- 4 status visuais para o usuário: Aguardando, Em Atendimento, Finalizado, Escalado
- Mensagem offline quando fora do horário comercial

---

## 8. Chat Interno (Equipe)

### Tipos de Canal
`general` | `team` | `direct`

### Funcionalidades
- **Threads aninhadas** estilo Google Chat (`thread_parent_id`)
- **Menções** (`@user`) com IDs em array `mentions UUID[]`
- **Reações** em JSONB (`{"👍": ["user_id_1"]}`)
- **Edição** de mensagens (`is_edited`, `edited_at`)
- **Deleção suave** (`is_deleted`, `deleted_at`)
- **Unread count** por membro (`last_read_at` em `chat_channel_members`)
- **Notificação** em tempo real via Socket.IO para membros do canal

---

## 9. Base de Conhecimento (KB)

### Status de Artigos
`draft` → `pending_review` → `published` | `archived`

### Fluxo de Aprovação
- Apenas administradores podem aprovar e publicar
- Campos: `submitted_for_review_at`, `reviewed_at`, `review_notes`
- Ao publicar: `ragService.indexArticle()` é chamado automaticamente para indexação RAG

### Versionamento
- Tabela `kb_article_versions` guarda histórico completo de edições

### Busca
- **Primária**: RAG via pgvector (busca semântica)
- **Fallback**: PostgreSQL FTS com `plainto_tsquery('portuguese', ...)`
- **Filtro de permissão**: RAG respeita `status = 'published' AND is_public = true`

---

## 10. Catálogo de Serviços

### Status de Requisição
`pending_approval` | `approved` | `rejected` | `in_progress` | `fulfilled` | `cancelled`

### Regras
- Toda requisição aprovada **gera um ticket** (`ticket_id` FK)
- Campos customizados por item de serviço (`service_item_fields`)
- Fluxo de aprovação opcional (`approval_required`, `approver_id`)
- SLA e auto-assign de time configurável por item

---

## 11. IA (RAG + Copiloto)

### Funcionalidades
1. **Barra de busca central** (ChatGPT-style): pesquisa KB ou cria ticket via conversa
2. **Coletor de dados por IA**: faz perguntas até completar campos obrigatórios do ticket
3. **Copiloto do técnico**: escuta o chat em segundo plano, sugere respostas, auto-categoriza (oculto ao cliente)
4. **RAG**: busca semântica com pgvector (cosine similarity), `VECTOR(1536)`, índice IVFFlat
5. **Chunking**: 512 palavras, 64 de sobreposição
6. **Rastreamento de tokens**: por tenant/mês no `portal_master.ai_token_usage` + local em `ai_token_usage_monthly`

### Fallback de IA
- `Promise.race([aiCall, timeout(10s)])` — timeout configurável por tenant
- Em falha: cria `platform_alert` (tipo `ai_fallback`), emite `ai:service_unavailable` via Socket.IO, redireciona para fila humana
- Frontend `AiSearchBar` exibe mensagem human-readable ao receber o evento

### Proteção contra Prompt Injection
- **14 padrões regex** cobrindo: "ignore previous instructions", "jailbreak", "system prompt", "DAN", "act as", etc.
- Truncamento em 4.000 chars
- Detecções logadas em `audit_logs` + `ai_conversation_audit` com `prompt_injections_detected = true`

### Upload de Imagens
- Imagens servem **apenas como anexos**
- Backend valida MIME via **magic bytes** (nunca via extensão do arquivo)
- **IA nunca recebe imagens como input visual** — sem análise de conteúdo de imagem

---

## 12. Upload de Arquivos

### Validação Magic Bytes
```
JPEG:  FF D8 FF
PNG:   89 50 4E 47
GIF:   47 49 46 38
WEBP:  52 49 46 46 + WEBP
PDF:   25 50 44 46
DOC:   D0 CF 11 E0
DOCX:  50 4B 03 04
XLSX:  50 4B 03 04
TXT:   sem assinatura (validado por MIME)
```

### Regras
- Leitura dos primeiros **16 bytes** para validar assinatura
- MIME allowlist estrita — scripts e executáveis são **bloqueados**
- Arquivo salvo **fora do webroot** (MinIO)
- Servido via **URL assinada** (presigned URL, TTL 1h)
- `BadRequestException` se magic bytes não correspondem ao MIME declarado

---

## 13. Webhooks (Bidirecional)

### Saída (Outbound)
- Assinatura **HMAC-SHA256** no header `X-Portal-Signature: sha256=...`
- Retry automático via BullMQ (configurável, padrão 3 tentativas)
- Timeout configurável por endpoint (padrão 30s)
- Log de entregas em `webhook_deliveries`

### Entrada (Inbound)
- Evento `ticket.acknowledged` de sistema externo → fecha ticket automaticamente por `external_id`
- Log em `webhook_inbound_logs` com `processed = true` após processamento
- Permite sistemas externos serem **fonte de verdade** para estado de tickets

---

## 14. Automação

### Triggers
`ticket_created` | `ticket_updated` | `ticket_status_changed` | `sla_breached` | `time_elapsed` | `chat_created`

### Condições (operadores)
`eq` | `neq` | `contains` | `in`

### Ações
`assign_ticket` | `set_priority` | `change_status` | `send_notification` | `webhook_call`

### Regras
- Condições e ações armazenadas em JSONB flexível
- Log de execução em `automation_logs` com status e ações executadas

---

## 15. SLA Engine

### Configuração
- Política SLA por tenant com targets por prioridade (critical/high/medium/low)
- `first_response_minutes` + `resolution_minutes` + escalação L1/L2 por prioridade
- Vinculado a `business_hours` (SLA conta apenas dentro do horário comercial)

### Motor
- @Cron a cada minuto para verificar breaches próximos
- BullMQ job com delay calculado exatamente no momento de criação do ticket
- Breach emite: notificação in-app + e-mail + dispara automações com trigger `sla_breached`
- `sla:breach:{ticketId}` job identificável e cancelável

---

## 16. Notificações

### Canais
- **In-app**: tempo real via Socket.IO (`NOTIFICATION_NEW`)
- **E-mail**: Nodemailer com templates PT-BR (abertura, fechamento, escalação, breach SLA)
- **Som**: arquivo `.mp3` no bundle, Web Audio API, preferência silenciosa por usuário

### Eventos que geram notificação
- Ticket atribuído ao técnico
- Ticket atualizado (watchers)
- Mensagem de chat nova
- Breach de SLA
- Menção `@user` em canal interno
- Alertas de sistema (`platform_alerts`)

### Preferências
- Tabela `notification_preferences` por usuário e tipo: `in_app`, `email`, `sound` booleanos

---

## 17. Trilha de Auditoria Onisciente

### Regras Absolutas
- Tabela `audit_logs` **NUNCA é deletada** — sem soft-delete, sem TTL
- Registra **absolutamente tudo**: visualizações, criações, atualizações, deleções, mudanças de permissão, ações IA
- `before_state` e `after_state` em JSONB completo
- `actor_email` desnormalizado para imutabilidade histórica (mesmo que o usuário seja deletado)
- `actor_type`: `user` | `system` | `ai` | `webhook`

### Auditoria IA
- `ai_conversation_audit` armazena **transcrição completa** de todas as conversas IA
- Inclui `prompt_injections_detected` + `injection_details`
- Nunca deletado — conformidade total

### Retenção de Dados
- Configurável por tenant via admin
- **Padrão: nunca deletar** (sem deleção automática)

---

## 18. Segurança

| Ameaça | Mitigação |
|---|---|
| Vazamento cross-tenant | DataSource isolado; JWT contém `tenantId`, validado em cada request |
| SSO domain hijack | Valida domínio do e-mail pós-callback contra `sso_allowed_domains` |
| Prompt Injection | Regex blocklist (14 padrões) + truncamento + log em auditoria |
| Upload malicioso | Magic bytes validation + MIME allowlist + storage fora do webroot |
| SQL Injection | TypeORM parameterized queries — sem raw SQL com interpolação |
| CORS | Origin validada contra domínio do tenant; `credentials: true` apenas para subdomínios config |
| Rate Limiting | @nestjs/throttler: 100 req/min geral; endpoints AI configurável por plano |
| Secrets em repouso | Credenciais de banco criptografadas com **AES-256** no portal_master |
| Webhook forgery | HMAC-SHA256 em toda entrega outbound |

---

## 19. Infraestrutura

### Docker Compose (serviços)
- `traefik` v3: wildcard TLS (Let's Encrypt ACME), roteamento por subdomínio
- `postgres` (pgvector/pgvector:pg16): única instância, múltiplos bancos dinâmicos
- `redis` 7-alpine: autenticação obrigatória
- `minio` + `minio-init`: storage S3-compatível com bucket criado no init
- `api` (NestJS): depende de postgres, redis, minio
- `web` (Vite/Nginx): frontend compilado

### Banco Master
- Extensões habilitadas: `uuid-ossp`, `pg_trgm`, `unaccent`
- Tabelas: `tenants`, `ai_token_usage`, `platform_alerts`

### Banco por Tenant
- Extensão `pgvector` habilitada no provisionamento
- Schema completo com todos os módulos em uma única migration inicial
- Seed de dados padrão executado automaticamente

---

## 20. Regras Gerais de UX/Produto

- Todas as datas exibidas em **UTC-3 (America/Sao_Paulo)** via `date-fns-tz`
- Interface **100% PT-BR** (sem i18n multi-idioma na V1)
- Layout limpo e minimalista com shadcn/ui
- Sidebar colapsável com navegação filtrada por permissão
- Indicador visual de SLA (ok / warning / breach) em toda lista de tickets
- Sons de notificação com preferência de silêncio por usuário
- Chat colapsado e desabilitado fora do horário comercial configurado
