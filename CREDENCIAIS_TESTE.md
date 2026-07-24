# Credenciais de Teste — Portal ITSM

## Portal do Cliente
**URL:** http://localhost:5173/cliente

| Nome | E-mail | Senha |
|---|---|---|
| João Silva | joao.silva@clienteabc.com.br | 123456 |
| Maria Santos | maria.santos@clienteabc.com.br | 123456 |

Após login → redirecionado para `/portal` (simula `clienteabc.empresa.com/`)

---

## Portal Operacional
**URL:** http://localhost:5173/operacional/login

| Nome | E-mail | Senha | Cargo | Permissões |
|---|---|---|---|---|
| Admin Sistema | admin@demo.com | admin1234 | Administrator | Acesso total |
| Carlos Técnico | tecnico@demo.com | 123456 | Technician | Chamados, chat, KB, relatórios |
| Ana Agente | agente@demo.com | 123456 | Support Agent | Chamados N1, chat |

Após login → redirecionado para `/operacional/app/dashboard`

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
- Todos os dados são **mockados** (sem chamadas à API real)
- Dados persistem apenas em localStorage (logout limpa a sessão)
- O chat widget flutuante aparece no canto inferior direito do portal do cliente
