# Portal ITSM — Documentação do Sistema

Plataforma completa de ITSM e Service Desk voltada para B2B (SaaS Multi-Tenant). O sistema integra atendimento por chamados, chat em tempo real, base de conhecimento e catálogo de serviços, tudo potencializado com IA generativa (RAG + Copiloto).

---

## 🏗️ Visão Geral e Estrutura do Projeto

O projeto é um **Monorepo** (gerenciado via Turborepo) que separa o código em aplicações e pacotes compartilhados.

```text
Portal/
├── apps/
│   ├── api/          # Backend: NestJS (porta 3000)
│   └── web/          # Frontend: Vite + React + TypeScript (porta 5173)
├── packages/
│   └── shared/       # Types, DTOs, Enums compartilhados entre front e back
├── firestore.rules   # Regras de segurança do banco Firebase (Portal IA)
├── .env              # ⚠️ NÃO commitar — variáveis de ambiente locais
├── .env.example      # Modelo de variáveis (este sim vai para o Git)
├── docker-compose.yml
└── README.md
```

### Stack Tecnológico
- **Frontend:** React 18, Vite 5, TypeScript, React Router, Recharts, Lucide Icons.
- **Backend:** NestJS 11, TypeORM, PostgreSQL 16 (+ pgvector para IA), BullMQ, Redis.
- **Autenticação:** Firebase Auth (InstaPasso como IdP) + Custom Tokens via Firebase Admin SDK.
- **Banco Firestore:** Firebase Firestore (Portal IA) com regras de segurança RBAC no servidor.
- **Armazenamento:** MinIO (compatível com S3) para anexos.

---

## 🛡️ Arquitetura de Segurança (Zero Trust / RBAC)

O sistema adota uma arquitetura **Zero Trust** com controle de acesso validado no servidor:

```
  [InstaPasso SSO]
        │
        │ 1. Usuário loga (Google SSO)
        ▼
  [Frontend React]
        │
        │ 2. Envia ID Token do InstaPasso para a API NestJS
        ▼
  [API NestJS → POST /api/auth/portal-token]
        │
        │ 3. Verifica assinatura do token (Firebase Admin SDK)
        │ 4. Busca o cargo (role) do usuário no Firestore
        │ 5. Gera Custom Token com claims: { role: 'Administrator' }
        ▼
  [Frontend React]
        │
        │ 6. signInWithCustomToken(auth, customToken)
        ▼
  [Firestore — Portal IA]
        │
        └─ Valida o Custom Claim antes de liberar qualquer dado.
           Ex: allow delete: if request.auth.token.role == 'Administrator';
```

> ⚠️ **Nenhuma senha de sistema** é usada no frontend. Todas as credenciais ficam protegidas no servidor (API NestJS) via variáveis de ambiente (`.env`).

---

## 👥 Dois Portais Distintos

O sistema é dividido em duas interfaces (roteadas no mesmo Frontend React):

1. **Portal do Cliente (`/cliente`)**:
   - Focado na experiência do usuário final (B2B).
   - Login via Magic Link ou SSO Google.
   - Interface conversacional com IA para autoatendimento.
   - Abertura simplificada de chamados (a IA infere categoria/subcategoria automaticamente).
   - Consulta à Base de Conhecimento e acompanhamento de tickets.

2. **Portal Operacional (`/operacional`)**:
   - Focado nos agentes, técnicos e administradores.
   - Login via Google SSO (validado pelo InstaPasso como IdP).
   - Dashboard de relatórios, catálogo de serviços, gestão de usuários, criação de artigos (KB).
   - Visualização e gestão completa dos chamados e chats em tempo real.
   - **Menu Dinâmico (RBAC):** Os módulos só aparecem se o Custom Token do usuário tiver a permissão correspondente. A regra de visibilidade é aplicada no servidor.

---

## ⚙️ Como Executar (Ambiente de Desenvolvimento)

### 1. Pré-requisitos
- Node.js (versão 20+)
- Docker e Docker Compose
- Arquivo `.env` preenchido (copiar de `.env.example`)
- Arquivo `apps/api/serviceAccountKey.json` (baixar do Firebase Console → Configurações → Contas de serviço)

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Preencher o .env com as chaves reais (Firebase, banco, JWT secrets, etc.)
```

### 3. Rodando o Frontend
```bash
cd apps/web
npm install
npm run dev
```
Acesse: **http://localhost:5173**

### 4. Subindo a Infraestrutura Completa (Backend + BD)
```bash
# Sobe os containers (PostgreSQL, Redis, MinIO)
docker compose up -d

# Roda a API NestJS
cd apps/api
npm install
npm run dev
```

- **API REST:** `http://localhost:3000`
- **Swagger/OpenAPI:** `http://localhost:3000/api/docs`

---

## 🔑 Acessos (Ambiente de Desenvolvimento)

### Portal do Cliente
**URL:** `http://localhost:5173/cliente`
- Login via Magic Link ou Google SSO.
- A senha do Magic Link é controlada pela variável `VITE_CLIENT_MOCK_PASS` no `.env`.

### Portal Operacional
**URL:** `http://localhost:5173/operacional/login`
- Login via Google SSO (conta com domínio autorizado no InstaPasso).
- O cargo (Administrator, Technician, Agent) é lido do Firestore e injetado no Custom Token pela API.

---

## 🗺️ Rotas Principais

| Rota | Descrição |
|---|---|
| `/cliente` | Login do cliente |
| `/portal` | Home do cliente (busca IA, chamados, artigos) |
| `/portal/tickets` | Chamados do cliente |
| `/portal/kb` | Base de conhecimento |
| `/operacional/login` | Login da equipe de TI |
| `/operacional/app/dashboard` | Dashboard operacional |
| `/operacional/app/tickets` | Gestão de chamados |
| `/operacional/app/chat` | Fila de chat externo |
| `/operacional/app/internal` | Chat interno da equipe |
| `/operacional/app/kb` | Base de conhecimento (gestão) |
| `/operacional/app/reports` | Relatórios e métricas |
| `/operacional/app/admin/users` | Gestão de usuários (admin) |
| `/operacional/app/admin/settings` | Configurações (admin) |

---

## 🛡️ Regras de Negócio e Funcionalidades

### 1. Controle de Acesso Baseado em Cargos (RBAC — Servidor)
- O cargo (`role`) é emitido via **Custom Token** pela API NestJS após validação do login SSO.
- O **Firestore** valida o token antes de liberar qualquer leitura/escrita — segurança no servidor, não apenas visual.
- Roles disponíveis: `Administrator`, `Technician`, `Agent`, `client`.

### 2. Catálogo de Serviços
- Gerenciado pelo Administrador no painel operacional.
- Cada serviço tem **Categoria**, **Subcategoria**, **Ícone** e **SLA** atrelados.
- Na abertura do chamado, a IA usa o Catálogo para classificar automaticamente a categoria.

### 3. Chamados (Tickets) e SLAs
- Tickets possuem status (`open`, `in_progress`, `resolved`, `closed`).
- Prazos de SLA (Primeira Resposta e Resolução) influenciam na prioridade.
- Tickets são imutáveis — nenhum usuário pode deletar (conformidade e auditoria).

### 4. Dashboards e Relatórios
- Métricas completas na rota `/operacional/app/reports`.
- Filtros por período, equipe, canal, cliente, status, categoria e prioridade.

---

## 🏗️ Arquitetura Multi-Tenant e Backend

- Banco `portal_master` gerencia os clientes (tenants).
- Cada tenant possui banco `tenant_{slug}` — isolamento total de dados.
- O mapeamento é feito via subdomínio interceptado no header HTTP.
- Uploads de arquivos passam pelo **MinIO** com URLs pré-assinadas com expiração (TTL).

---

## 🚀 Status do Projeto

- [x] Monorepo e UI Principal.
- [x] Separação de Portais (Cliente vs Operacional).
- [x] RBAC via Servidor (Firebase Custom Tokens + NestJS Admin SDK).
- [x] Proteção de Credenciais (Variáveis de Ambiente — `.env`).
- [x] Regras de Segurança no Banco (Firestore Security Rules — Zero Trust).
- [x] Catálogo de Serviços Dinâmico implementado na UI.
- [ ] Integração com Backend (Substituir chamadas Firebase por API NestJS completa).
- [ ] Chat em tempo real (Socket.io).
- [ ] Integração com IA Real (LangChain / OpenAI / RAG).
- [ ] Trilha de Auditoria Imutável.
- [ ] Anonimização LGPD (Direito ao Esquecimento).
