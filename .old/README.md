# SaaS Portal AI 🚀

Bem-vindo ao repositório do **SaaS Portal AI**, uma plataforma moderna de atendimento ao cliente (Helpdesk) desenhada com o conceito "AI-First". O grande diferencial desta plataforma é ter a Inteligência Artificial agindo não apenas como um chatbot de autoatendimento, mas como um **Copiloto integrado para o técnico de suporte (Agente)**.

## 🧠 Arquitetura do Sistema

Este repositório é um **Monorepo** (gerenciado por NPM Workspaces) dividido estruturalmente em duas aplicações centrais:

### 1. Frontend (`apps/web`)
Construído utilizando:
- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Ícones:** Heroicons

**Principais Módulos do Frontend:**
- **Control Plane (God Mode):** O ambiente isolado `/super-admin` utilizado pelos gestores da plataforma para monitorar, faturar e governar todos os Tenants (Empresas).
- **Live Inbox:** O coração operacional dos técnicos. Construída com um layout de tripla coluna imersivo:
  - *Esquerda (Fila de Conversas):* Divide chats inteligentes entre "Entrada", "Meus", "Em Atendimento" e "Finalizados", sempre mostrando o SLA e o sentimento atual da conversa.
  - *Centro (Chat de Operações):* A interface de conversa onde o Técnico atua de forma manual ou aprova/recusa sugestões rápidas geradas pela IA.
  - *Direita (Contexto CRM):* Perfil do cliente, transferência de chat para outros técnicos, base de conhecimento e monitoramento do SLA (Service Level Agreement).
- **Modais Avançados:** 
  - *Modal de Takeover:* Permite que um admin "roube" um atendimento.
  - *Modal de Encerramento (Checkout):* Gera resumos automáticos do atendimento, prediz o CSAT e sugere tags usando IA.
  - *Base de Conhecimento Rápida:* Pesquisa contextual gerando respostas prontas para o técnico em tempo real baseada em RAG.

### 2. Backend (`apps/api`)
Construído utilizando:
- **Framework:** FastAPI (Python)
- **Gerenciador de Pacotes:** `uv`
- **Banco de Dados & ORM:** SQLAlchemy e Alembic (arquitetura Multitenant).

**Principais Módulos do Backend:**
- **Gerenciador Multi-Tenant:** Arquitetura que isola de forma segura os dados (chats, clientes, bases de conhecimento) de cada empresa assinante (Tenant).
- **Integrações (ex: TiFlux):** Endpoints criados para sincronizar os dados da plataforma com sistemas externos de chamados de TI.
- **Motor de RAG (Retrieval-Augmented Generation):** Módulos (`indexer`, `retriever`, `chain`) encarregados de processar documentos de texto e PDF, "vetorizar" esse conteúdo, e injetar nas respostas sugeridas ao técnico com base no problema narrado pelo cliente final.

## 💡 Fluxo de Trabalho (Técnicos)
1. O chat entra na Fila **"Entrada"** (A IA já realizou uma triagem preliminar, determinou a tag de urgência e mapeou o sentimento).
2. O técnico clica em **"Assumir Atendimento"**.
3. A IA lê a base de conhecimento do respectivo Tenant e sugere uma resposta em tempo real. O técnico pode apenas clicar em **"Aprovar e Enviar"**.
4. Caso precise envolver outro setor, o técnico pode acionar a aba **"Transferir Chat"** para parear ou repassar a conversa para a equipe correta.
5. Após sanar o problema, o técnico clica em **"Encerrar Chat"**. O sistema exibe o **Checkout Modal** onde a IA já digitou um resumo gerencial da conversa para ficar arquivado, sugere tags (ex: *Bug*, *Dúvida*) e tenta prever qual seria a nota de CSAT (Satisfação) do cliente para aquele atendimento.

## 🚀 Como Rodar o Projeto

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

### Backend
```bash
cd apps/api
uv sync
uv run uvicorn src.saas_portal.main:app --reload
```

## 🤝 Contribuição
Este projeto está ativamente em desenvolvimento. Equipes de engenharia de software e UX/UI Design devem utilizar este projeto base para refinar as rotas de criação e gestão de usuários (CRUDs) e mapear fluxos avançados das automações.
