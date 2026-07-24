# Portal ITSM — Documentação do Sistema

Plataforma completa de ITSM e Service Desk voltada para B2B (SaaS Multi-Tenant). O sistema integra atendimento por chamados, chat em tempo real, base de conhecimento e catálogo de serviços, tudo potencializado com IA generativa (RAG + Copiloto).

---

## 🏗️ Visão Geral e Estrutura do Projeto

O projeto é um **Monorepo** (gerenciado via Turborepo) que separa o código em aplicações e pacotes compartilhados, garantindo organização e reuso de código.

```text
Portal/
├── apps/
│   ├── api/          # Backend: NestJS (porta 3000)
│   └── web/          # Frontend: Vite + React + Tailwind CSS (porta 5173)
├── packages/
│   └── shared/       # Types, DTOs, Enums compartilhados entre front e back
├── .env              # Variáveis de ambiente
├── docker-compose.yml # Orquestração de containers (DBs, Redis, MinIO)
└── README.md         # Documentação principal
```

### Stack Tecnológico
- **Frontend:** React 18, Vite 5, Tailwind CSS, TypeScript, React Router, Recharts, Lucide Icons.
- **Backend:** NestJS 11, TypeORM, PostgreSQL 16 (+ pgvector para IA), BullMQ, Redis.
- **Armazenamento:** MinIO (compatível com S3) para anexos.

---

## 👥 Dois Portais Distintos

O sistema é dividido em duas interfaces (roteadas no mesmo Frontend React):

1. **Portal do Cliente (`/cliente`)**: 
   - Focado na experiência do usuário final.
   - Interface conversacional com a IA para autoatendimento.
   - Abertura simplificada de chamados (sem pedir categoria/subcategoria, pois a IA infere isso).
   - Consulta à Base de Conhecimento e acompanhamento de tickets.

2. **Portal Operacional (`/operacional`)**: 
   - Focado nos agentes, técnicos e administradores.
   - Dashboard de relatórios, catálogo de serviços, gestão de usuários, criação de artigos (KB).
   - Visualização e gestão completa dos chamados.
   - **Menu Dinâmico (RBAC):** Os módulos só aparecem se o usuário tiver a permissão correspondente.

---

## ⚙️ Como Executar (Ambiente de Desenvolvimento)

Atualmente, o **Frontend opera com dados mockados** enquanto o backend está em desenvolvimento. Isso permite testar todas as funcionalidades visuais e fluxos sem depender do banco de dados.

### 1. Pré-requisitos
- Node.js (versão 20+)
- Docker e Docker Compose (para subir os bancos e serviços auxiliares)

### 2. Rodando o Frontend (Mock Mode)
Abra um terminal na raiz do projeto e execute:
```bash
cd apps/web
npm install
npm run dev
```
Acesse no navegador: **http://localhost:5173**

### 3. Subindo a Infraestrutura Completa (Backend + BD)
Se precisar testar a integração com a API:
```bash
# Sobe os containers (PostgreSQL, Redis, MinIO)
docker compose up -d

# Roda a API
cd apps/api
npm install
npm run start:dev
```

---

## 🔑 Acessos e Credenciais (Mockadas)

Enquanto o backend não é integrado, use as seguintes credenciais para acessar os portais:

### Portal do Cliente
**URL:** `http://localhost:5173/cliente/login`
- **E-mail:** `joao.silva@clienteabc.com.br`
- **Senha:** `123456`

### Portal Operacional
**URL:** `http://localhost:5173/operacional/login`
- **Administrador (Acesso Total):** `admin@demo.com` / `admin1234`
- **Técnico (Acesso Parcial):** `tecnico@demo.com` / `123456`
- **Agente (Suporte):** `agente@demo.com` / `123456`

---

## 🛡️ Regras de Negócio e Funcionalidades Implementadas

### 1. Controle de Acesso Baseado em Regras (RBAC)
- O sistema possui módulos granulares de acesso (ex: `tickets.view`, `catalog.manage`, `admin.users`).
- No portal operacional, em **Configurações > Usuários**, o Administrador pode marcar/desmarcar permissões individuais para os técnicos. A interface se adapta automaticamente ocultando menus que o técnico não tem acesso.

### 2. Catálogo de Serviços
- Gerenciado pelo Administrador no painel operacional.
- Cada serviço tem **Categoria**, **Subcategoria**, **Ícone** e **SLA** atrelados.
- Na abertura do chamado pelo portal do cliente, o cliente relata o problema de forma livre. A IA usa o Catálogo de Serviços como base de conhecimento para classificar automaticamente o chamado na Categoria e Subcategoria corretas.

### 3. Chamados (Tickets) e SLAs
- Tickets possuem status (`open`, `in_progress`, `resolved`, `closed`).
- A tela de Detalhes do Chamado no Operacional avisa o técnico caso a IA tenha sugerido a categoria do chamado, permitindo alteração manual.
- Prazos de SLA (Primeira Resposta e Resolução) ficam visíveis e influenciam na prioridade.

### 4. Dashboards e Relatórios
- Tela completa de métricas na rota `/operacional/reports`.
- Filtros abrangentes (Período, Equipe, Canal, Cliente, Status, Categoria, Prioridade).
- Gráficos renderizados via `Recharts`.

---

## 🏗️ Arquitetura Multi-Tenant e Segurança (Backend)

- O sistema utiliza uma abordagem de dados separados. Existe um banco `portal_master` que gerencia os clientes (tenants).
- Cada tenant (cliente) possui seu próprio banco `tenant_{slug}`, garantindo isolamento total de dados.
- O mapeamento é feito via subdomínio (ex: `clienteabc.portal.com`) interceptado no header HTTP.
- O envio de arquivos passa pelo `MinIO`, com geração de URLs pré-assinadas que expiram (TTL).

---

## 🚀 Próximas Fases e Backlog

- [x] Construção do Monorepo e UI Principal.
- [x] Separação de Portais (Cliente vs Operacional).
- [x] Sistema de Permissões RBAC implementado na UI.
- [x] Catálogo de Serviços Dinâmico implementado na UI.
- [ ] Integração com Backend (Substituir Mocks por chamadas API Axios).
- [ ] Implementação de Chats em tempo real (Socket.io).
- [ ] Integração com IA Real (LangChain / OpenAI / RAG).
