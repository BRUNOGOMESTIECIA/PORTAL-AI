# Portal ITSM — Plano de Implementação

## Estado Atual

**Fase 1 (Fundação) — COMPLETA** ✅

---

## O Que Foi Implementado (Fase 1)

### Estrutura do Projeto
```
Portal/
├── apps/
│   ├── api/                    ← NestJS 11 (backend)
│   └── web/                    ← Vite + React 18 (frontend)
├── packages/
│   └── shared/                 ← Enums e tipos compartilhados
├── scripts/postgres/init.sql
├── docker-compose.yml
├── turbo.json
├── tsconfig.json
├── .gitignore
└── .env.example
```

### Backend — Implementado
| Componente | Arquivo |
|---|---|
| Multi-tenant middleware (subdomínio → DB) | `apps/api/src/core/database/tenant.middleware.ts` |
| Pool LRU de DataSources (max 100, AES-256) | `apps/api/src/core/database/tenant-datasource.manager.ts` |
| AsyncLocalStorage tenant context | `apps/api/src/core/database/tenant.context.ts` |
| Schema master DB + migration | `apps/api/src/core/database/master/migrations/` |
| Schema tenant completo + migration + seed | `apps/api/src/core/database/tenant/migrations/` |
| Auth JWT httpOnly + refresh | `apps/api/src/core/auth/auth.service.ts` |
| Estratégia JWT (cookie + Bearer) | `apps/api/src/core/auth/strategies/jwt.strategy.ts` |
| SSO Google + Microsoft (OIDC) | `apps/api/src/core/auth/strategies/` |
| Guard de permissões (RBAC) | `apps/api/src/core/auth/guards/permission.guard.ts` |
| AI service + fallback (Promise.race 10s) | `apps/api/src/core/ai/ai.service.ts` |
| RAG service (pgvector cosine) | `apps/api/src/core/ai/rag.service.ts` |
| Sanitizador Prompt Injection (14 regex) | `apps/api/src/core/ai/prompt-sanitizer.ts` |
| Magic bytes validator | `apps/api/src/core/storage/mime-validator.ts` |
| Socket.IO gateway + Redis adapter | `apps/api/src/core/websocket/ws.gateway.ts` |
| Heartbeat service (@Cron 30s) | `apps/api/src/core/websocket/heartbeat.service.ts` |
| Módulos: tickets, users, roles | `apps/api/src/modules/` |
| Módulos: chat-external, chat-internal | `apps/api/src/modules/` |
| Módulos: kb, service-catalog, sla | `apps/api/src/modules/` |
| Módulos: automation, webhooks | `apps/api/src/modules/` |
| Módulos: notifications, reports, audit, ai-chat | `apps/api/src/modules/` |
| App module principal | `apps/api/src/app.module.ts` |

### Frontend — Implementado
| Componente | Arquivo |
|---|---|
| Axios com interceptor de refresh | `apps/web/src/services/api.ts` |
| AuthContext + hasPermission O(1) | `apps/web/src/hooks/use-auth.tsx` |
| Socket.IO client + handlers globais | `apps/web/src/hooks/use-socket.tsx` |
| Utilitários de data (UTC-3 fixo) | `apps/web/src/lib/utils.ts` |
| AppShell (sidebar colapsável + filtro RBAC) | `apps/web/src/components/layout/AppShell.tsx` |
| AiSearchBar (ChatGPT-style + fallback) | `apps/web/src/components/ai/AiSearchBar.tsx` |
| NotificationCenter (WebSocket + som) | `apps/web/src/components/layout/NotificationCenter.tsx` |
| Login page (email + SSO Google/Microsoft) | `apps/web/src/pages/auth/LoginPage.tsx` |
| Dashboard (métricas + SLA compliance) | `apps/web/src/pages/dashboard/DashboardPage.tsx` |
| Tickets list (filtros, paginação, SLA) | `apps/web/src/pages/tickets/TicketsPage.tsx` |
| Router lazy-loaded | `apps/web/src/app/router.tsx` |

### Packages Shared — Implementado
- 9 arquivos de enums: tenant, ticket, chat, user, sla, ai, kb, notification, automation
- `types/socket.types.ts`: `SocketEvent` enum + `SOCKET_ROOMS` factory functions
- `types/tenant.types.ts`: interfaces TenantConfig, SsoConfig, TenantSettings, TenantContext

---

## Fases Pendentes

---

## Fase 2 — Tickets e SLA (Semanas 3–4)

### Objetivos
Motor SLA completo com BullMQ, upload de arquivos, e-mails transacionais, trilha de auditoria global.

### Tarefas Backend
- [ ] **BullMQ SLA jobs**: job `sla:breach:{ticketId}` com delay calculado na criação do ticket
- [ ] **SlaModule completo**: `calculateDueDate()` respeitando business hours, criar/cancelar breach jobs
- [ ] **Upload endpoint**: `POST /tickets/:id/attachments` + `POST /comments/:id/attachments`
- [ ] **Interceptor global de auditoria**: NestJS `APP_INTERCEPTOR` registra antes/depois em `audit_logs`
- [ ] **E-mail: ticket aberto** (template PT-BR para requester + assignee)
- [ ] **E-mail: ticket fechado** (com CSAT request link)
- [ ] **E-mail: ticket escalado** (para novo assignee)
- [ ] **E-mail: breach SLA** (para assignee + manager)
- [ ] **CRUD de watchers**: `POST/DELETE /tickets/:id/watchers`
- [ ] **CRUD de tags**: `PUT /tickets/:id/tags`
- [ ] **Ticket filho**: validação de `parent_ticket_id` na criação
- [ ] **Comentários**: `POST /tickets/:id/comments` com suporte a `is_internal` e `parent_comment_id`

### Tarefas Frontend
- [ ] **TicketDetailPage** completa: comentários, watchers, attachments, histórico
- [ ] **TicketCreatePage**: formulário completo com campos customizados por categoria
- [ ] **TicketCloseModal**: campo `resolution_category_id` obrigatório no fechamento
- [ ] **SlaIndicator**: componente de barra de progresso visual reutilizável
- [ ] **Uploader de arquivos**: drag-and-drop com validação de tipo e tamanho no cliente
- [ ] **Ticket filho**: UI para criar/visualizar relação pai-filho

### Verificação
- [ ] Criar ticket com prioridade crítica → verificar SLA due dates calculadas
- [ ] Mudar status para `pending` → SLA pausa; voltar para `in_progress` → SLA retoma e estende
- [ ] Upload de `.exe` disfarçado como `.jpg` → rejeitado com 400
- [ ] Fechar ticket → e-mail enviado + CSAT criado + audit_log registrado

---

## Fase 3 — Chat em Tempo Real (Semanas 5–6)

### Objetivos
UI completa de chat externo (fila + sessão + copiloto), chat interno (canais + threads + menções).

### Tarefas Backend
- [ ] **ChatExternalModule endpoints**: `GET /chat/queues`, `POST /chat/sessions`, `GET /chat/sessions/:id/messages`
- [ ] **Heartbeat endpoint**: `POST /chat/sessions/:id/heartbeat`
- [ ] **Agente aceita sessão**: `PUT /chat/sessions/:id/accept`
- [ ] **Escalação**: `PUT /chat/sessions/:id/escalate`
- [ ] **Finalizar sessão**: `PUT /chat/sessions/:id/finish` (dispara CSAT)
- [ ] **ChatInternalModule endpoints**: canal CRUD, mensagem CRUD, thread, menções, reações
- [ ] **DM entre usuários**: canal direto criado automaticamente

### Tarefas Frontend
- [ ] **ChatQueuePage**: lista de sessões aguardando, aceitar sessão
- [ ] **ChatSessionPage**: mensagens em tempo real, campo de texto, botão de finalizar, escalação
- [ ] **AiCopilotPanel**: painel lateral com sugestões IA (só visível ao agente)
- [ ] **Heartbeat ping**: `setInterval` no cliente enviando `chat:heartbeat` a cada 30s
- [ ] **Status visual da sessão**: badge waiting/active/finished/escalated/abandoned
- [ ] **ChatWidget embed**: widget standalone para inserir no site do cliente
- [ ] **Auto-colapso fora do horário**: consulta business_hours, recalcula a cada minuto
- [ ] **InternalChannelsPage**: sidebar com canais + unread count
- [ ] **InternalMessagePage**: mensagens, threads inline, reações emoji, menções @user

### Verificação
- [ ] Simular oscilação de internet: heartbeat para → aguardar `heartbeat_tolerance_seconds` → sessão marcada `abandoned`
- [ ] Fora do horário comercial: widget colapsado, envio desabilitado
- [ ] Copiloto sugere resposta → sugestão invisível na view do cliente
- [ ] Thread aninhada em mensagem interna → replies em ordem cronológica

---

## Fase 4 — IA Completa e Copiloto (Semanas 7–9)

### Objetivos
Streaming de respostas IA, wizard de criação de ticket por conversa, dashboard de consumo de tokens.

### Tarefas Backend
- [ ] **Streaming SSE**: endpoint `GET /ai/chat/stream` com Server-Sent Events
- [ ] **Wizard de ticket via IA**: estado de conversa em `ai_conversations`, coleta campos obrigatórios iterativamente
- [ ] **Auto-categorização**: ao criar ticket via IA, preencher `ai_category_id` + `ai_category_confidence`
- [ ] **Copiloto endpoint**: `POST /chat/sessions/:id/copilot-suggest` (alimenta `is_ai_suggestion = true`)
- [ ] **Token tracking endpoint**: contador por request atualiza `ai_token_usage_monthly` + `portal_master.ai_token_usage`
- [ ] **Endpoint admin**: `GET /admin/ai-usage` para consumo agregado por tenant

### Tarefas Frontend
- [ ] **Streaming UX**: exibir resposta IA palavra por palavra (SSE)
- [ ] **Wizard de ticket por conversa**: UI de formulário guiado por chat IA
- [ ] **CopilotPanel**: exibir sugestão IA no chat externo (aceitar/descartar)
- [ ] **AI Usage Dashboard**: gráfico de consumo de tokens por período (Recharts)
- [ ] **Indicador de fallback**: banner quando IA indisponível → redirecionado para humano
- [ ] **Histórico de conversas IA**: admin pode visualizar transcrições completas (auditoria)

### Verificação
- [ ] Criar ticket via conversa IA: IA faz perguntas → ao completar campos → ticket criado com `ai_category_id`
- [ ] Timeout IA simulado → fallback ativado → `platform_alert` criado → banner no frontend
- [ ] Input "ignore previous instructions" → detectado, logado, não enviado para LLM
- [ ] Dashboard admin mostra consumo correto de tokens do mês

---

## Fase 5 — KB e Catálogo de Serviços (Semanas 10–11)

### Objetivos
KB completa com editor rich text, versionamento, fluxo de aprovação. Catálogo com wizard de requisição.

### Tarefas Backend
- [ ] **KB endpoints completos**: CRUD artigos, CRUD categorias, submit for review, approve/reject, publish
- [ ] **Versionamento**: salvar versão em `kb_article_versions` em cada update
- [ ] **Re-indexação RAG**: ao publicar artigo → `ragService.indexArticle()` automático
- [ ] **Votos**: `POST /kb/articles/:id/vote` (helpful/unhelpful)
- [ ] **Catálogo endpoints**: CRUD categorias, CRUD itens, `POST /catalog/requests`, fluxo de aprovação
- [ ] **Geração de ticket**: ao aprovar requisição → criar ticket com `source = 'catalog'`

### Tarefas Frontend
- [ ] **KbSearchPage**: barra de busca RAG com resultados em tempo real
- [ ] **KbArticlePage**: renderização Markdown/rich text, votos, artigos relacionados
- [ ] **KbEditorPage**: editor TipTap (rich text) para criação/edição de artigos
- [ ] **KbReviewPage**: lista de artigos pendentes de revisão (apenas admin)
- [ ] **KbCategoryTree**: navegação hierárquica de categorias
- [ ] **CatalogPage**: grid de itens por categoria
- [ ] **CatalogRequestWizard**: formulário dinâmico por campos do item de serviço
- [ ] **RequestStatusPage**: acompanhamento de requisições do usuário

### Verificação
- [ ] Criar artigo → submit for review → aprovação → artigo aparece em busca RAG
- [ ] Editar artigo publicado → versão anterior preservada em `kb_article_versions`
- [ ] Busca semântica: query com palavras diferentes retorna artigo relevante
- [ ] Requisição de catálogo que requer aprovação → notificação para aprovador → ticket gerado após aprovação

---

## Fase 6 — Automação e Webhooks (Semana 12)

### Objetivos
Builder visual de regras de automação. Gerenciamento de webhooks com delivery logs.

### Tarefas Backend
- [ ] **Rule evaluator**: motor que avalia `trigger_conditions` contra entidades reais
- [ ] **Actions executor**: execute cada action com `params` do JSONB
- [ ] **Endpoints automação**: CRUD de regras, toggle ativo/inativo, logs de execução
- [ ] **Endpoints webhooks**: CRUD de endpoints, reenvio manual, logs de entrega
- [ ] **Inbound processor**: validar HMAC da requisição inbound + processar `ticket.acknowledged`

### Tarefas Frontend
- [ ] **AutomationRulesPage**: lista de regras com toggle ativo/inativo
- [ ] **AutomationRuleBuilder**: UI visual — selecionar trigger → adicionar condições → adicionar ações
- [ ] **AutomationLogsPage**: histórico de execuções com status e detalhe
- [ ] **WebhooksPage**: lista de endpoints configurados
- [ ] **WebhookCreatePage**: URL, secret, selecionar eventos (checkboxes)
- [ ] **WebhookDeliveryLogsPage**: histórico com status HTTP e botão de reenvio

### Verificação
- [ ] Criar regra: `ticket_created` + `priority = critical` → `assign_ticket` para usuário X → criar ticket critical → verificar assignee
- [ ] Webhook de saída: criar ticket → delivery log com `status = delivered` + HMAC no header
- [ ] Webhook de entrada `ticket.acknowledged`: enviar payload → ticket fechado + log processado

---

## Fase 7 — Painel Admin e Relatórios (Semanas 13–14)

### Objetivos
Admin completo por tenant e master admin. Relatórios com gráficos e exportação.

### Tarefas Backend
- [ ] **Admin tenant endpoints**: CRUD usuários, CRUD roles/permissions, configurar SLA, business hours, módulos habilitados
- [ ] **Admin master endpoints**: listar todos tenants, criar tenant via API (provisioning completo), suspender/reativar
- [ ] **Relatórios**: query endpoints com filtros de período, agrupamento por prioridade/categoria/assignee
- [ ] **Exportação CSV**: endpoint `GET /reports/tickets/export?format=csv`
- [ ] **CSAT agregado**: média, NPS, distribuição de scores

### Tarefas Frontend
- [ ] **AdminUsersPage**: CRUD usuários, atribuir role, ativar/desativar
- [ ] **AdminRolesPage**: CRUD roles, editor de permissões (checkboxes)
- [ ] **AdminSlaPage**: editor de políticas SLA + targets por prioridade
- [ ] **AdminBusinessHoursPage**: configurador de horário por dia da semana + feriados
- [ ] **AdminModulesPage**: toggles para habilitar/desabilitar módulos por tenant
- [ ] **AdminTenantsPage** (master admin): lista, criar, suspender tenants
- [ ] **ReportsTicketsPage**: gráfico de tickets por período (Recharts), filtros
- [ ] **ReportsSlaPage**: compliance por prioridade, tempo médio de resolução
- [ ] **ReportsCsatPage**: NPS, distribuição de scores, comentários
- [ ] **ReportsAiUsagePage**: consumo de tokens por período, custo estimado

### Verificação
- [ ] Criar novo tenant via admin → banco provisionado → login funciona no subdomínio
- [ ] Configurar SLA diferente → novos tickets usam a política nova
- [ ] Desabilitar módulo KB → menu desaparece para todos os usuários do tenant

---

## Fase 8 — Hardening e QA (Semanas 15–16)

### Objetivos
Testes E2E automatizados, auditoria de segurança OWASP, benchmarks de performance.

### Testes E2E (Playwright)
- [ ] Fluxo completo: cadastro tenant → login SSO → abrir ticket → SLA breach → fechar + CSAT
- [ ] Chat: fila de atendimento → agente aceita → conversa → finalizar → CSAT
- [ ] SSO domain block: login com e-mail fora do domínio → bloqueado com mensagem correta
- [ ] AI fallback: mock de timeout na API IA → fallback ativado → banner exibido
- [ ] Webhook inbound: simular `ticket.acknowledged` → ticket fechado
- [ ] Upload malicioso: `.exe` renomeado como `.jpg` → rejeição 400

### Testes Unitários
- [ ] SLA engine: cálculo de due dates com business hours, pausa/retomada
- [ ] Prompt sanitizer: 14 padrões detectados + não-detecção de inputs legítimos
- [ ] Heartbeat: abandono após tolerance + não-abandono dentro da tolerance
- [ ] Magic bytes validator: cada tipo de arquivo válido + inválido

### Auditoria de Segurança
- [ ] OWASP Top 10 checklist
- [ ] Teste de isolamento cross-tenant: request com JWT de tenant A contra slug tenant B
- [ ] Rate limiting: verificar throttle em endpoints críticos
- [ ] Secrets: varredura de credenciais hardcoded

### Performance
- [ ] Benchmark Socket.IO: 1.000 conexões simultâneas com Redis adapter
- [ ] DataSource pool: 100 tenants simultâneos sem timeout
- [ ] Consultas pgvector: tempo médio de busca semântica < 200ms

### Documentação
- [ ] README de onboarding: como provisionar novo tenant
- [ ] `.env.example` completo e documentado
- [ ] Swagger/OpenAPI exportado como arquivo estático

---

## Como Rodar o Projeto

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 2. Subir todos os serviços
docker compose up

# As migrations do banco master e seed são executados automaticamente
# na inicialização da API

# API:     http://localhost:3000
# Swagger: http://localhost:3000/api/docs
# Web:     http://localhost:5173
# MinIO:   http://localhost:9001 (console)
# Traefik: http://localhost:8080 (dashboard)
```

### Primeiro Tenant (desenvolvimento local)
```bash
# Após subir os serviços, criar primeiro tenant via API
curl -X POST http://localhost:3000/api/v1/admin/tenants \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "slug": "acme"}'

# Acessar: http://acme.localhost:5173
# (adicionar 127.0.0.1 acme.localhost ao /etc/hosts ou usar Traefik local)
```

---

## Checklist de Verificação Global (ao final de todas as fases)

1. `docker compose up` sem erros; todas as health checks verdes
2. Criar novo tenant via API → banco criado → migrations aplicadas → seed OK
3. Login SSO Google/Microsoft → bloqueio de e-mail fora do domínio
4. Abrir ticket via IA → campos coletados em conversa → ticket criado com `ai_category_id`
5. Chat externo: simular queda de conexão → heartbeat expirado → sessão `abandoned`
6. Upload de `.exe` disfarçado como `.jpg` → rejeitado pelo magic bytes validator
7. Input "ignore previous instructions" → detectado, logado, não enviado para LLM
8. Simular timeout da API IA → fallback → chat redirecionado para humano → `platform_alert` criado
9. Webhook externo `ticket.acknowledged` → ticket fechado automaticamente
10. Consultar `audit_logs` → todas as operações das etapas acima registradas com `before_state`/`after_state`
