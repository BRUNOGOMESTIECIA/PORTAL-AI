# Credenciais de Teste — Portal ITSM

> ⚠️ O sistema usa **Firebase Auth + Google SSO** via InstaPasso. Não existem mais senhas locais fixas.
> Para logar, a conta Google deve estar cadastrada e ativa no InstaPasso.

---

## Portal do Cliente
**URL:** `http://localhost:5173/cliente`

| Tipo de Login | Como Fazer |
|---|---|
| **Google SSO** | Clicar em "Entrar com Google" e usar conta com domínio autorizado |
| **Magic Link** | Digitar o e-mail e clicar no link enviado |

> A senha usada internamente pelo Magic Link é controlada pela variável `VITE_CLIENT_MOCK_PASS` no arquivo `.env`. Não é exposta no código-fonte.

---

## Portal Operacional
**URL:** `http://localhost:5173/operacional/login`

| Nome | Conta Google | Cargo | Permissões |
|---|---|---|---|
| Admin Sistema | conta autorizada no InstaPasso | Administrator | Acesso total |
| Carlos Técnico | conta autorizada no InstaPasso | Technician | Chamados, chat, KB, relatórios |
| Ana Agente | conta autorizada no InstaPasso | Agent | Chamados N1, chat |

> O **cargo** (role) de cada operador é definido no campo `type` do documento do usuário no **Firestore** (projeto `portal-ia-784f6`). A API NestJS lê esse cargo no login e injeta no Custom Token.

---

## Rotas principais

| Rota | Descrição |
|---|---|
| `/cliente` | Login do cliente |
| `/portal` | Home do cliente (busca IA, chamados, artigos) |
| `/portal/tickets` | Chamados do cliente |
| `/portal/kb` | Base de conhecimento |
| `/operacional/login` | Login da equipe de TI |
| `/operacional/app/dashboard` | Dashboard operacional |
| `/operacional/app/tickets` | Gestão de chamados |
| `/operacional/app/chat` | Fila de chat |
| `/operacional/app/internal` | Chat interno da equipe |
| `/operacional/app/kb` | Gerenciamento da base de conhecimento |
| `/operacional/app/reports` | Relatórios |
| `/operacional/app/admin/users` | Gestão de usuários (admin) |
| `/operacional/app/admin/settings` | Configurações (admin) |

---

## Observações
- O login usa **Firebase Auth** (Google SSO) via InstaPasso como provedor de identidade.
- A segurança é validada no **servidor** (API NestJS + Firestore Rules), não apenas visualmente.
- Logs de autenticação e erros aparecem no Console do Firebase → Authentication.
