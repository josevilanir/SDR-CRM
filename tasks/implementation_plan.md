# Plano de Implementação: SDR CRM com Gerador de Mensagens IA

Este projeto consiste em um Mini CRM para SDRs (Sales Development Representatives) focado em personalização de mensagens via IA, utilizando uma arquitetura multi-tenant robusta e processamento assíncrono.

## User Review Required

> [!IMPORTANT]
> **Stack Tecnológica Confirmada**:
> - **Frontend**: React + Vite + Tailwind CSS (para design premium e responsivo).
> - **Backend/Banco/Auth**: Supabase (PostgreSQL, Auth, Edge Functions).
> - **IA**: Google AI (Gemini 1.5 Flash).
> - **Estilização**: Glassmorphism, Dark Mode e Micro-animações (Framer Motion).

> [!WARNING]
> **Commits**: Conforme solicitado, **eu não realizarei commits**. Você (USER) fará os commits progressivos conforme avançarmos.

## Perguntas em Aberto

1. **Campos Personalizados**: Deseja que a criação de campos personalizados seja via JSONB (mais flexível) ou via tabela de definições de campos (mais estruturado)? *Minha recomendação: Tabela de definições para facilitar a validação de campos obrigatórios por etapa.*
2. **Provedor de LLM**: Confirmado: **Google Gemini 1.5 Flash** (pela eficiência e custo-benefício).

## Mudanças Propostas

---

### [COMPLETED] [Componente 1] Infraestrutura e Banco de Dados (Supabase)

Definição do schema relacional com foco em isolamento por workspace e suporte a campos dinâmicos. (Migration aplicada).

#### [NEW] [schema.sql](file:///c:/Users/vilan/SDR%20CRM/supabase/migrations/20240507_init.sql)
- Tabelas: `workspaces`, `profiles` (vínculo com auth.users), `leads`, `lead_custom_fields`, `field_definitions`, `campaigns`, `messages`.
- **Row Level Security (RLS)**: Políticas para garantir que usuários só acessem dados de seus respectivos `workspace_id`.

---

### [COMPLETED] [Componente 2] Autenticação e Gestão de Workspace

Fluxo de login, cadastro e inicialização de workspace. (Implementado com WorkspaceProvider e RPC).

---

### [IN PROGRESS] [Componente 3] Gestão de Leads e Kanban

Interface principal para visualização e movimentação de leads.

#### [NEW] [KanbanBoard.tsx](file:///c:/Users/vilan/SDR%20CRM/src/components/leads/KanbanBoard.tsx)
- Implementação drag-and-drop para movimentação entre etapas.
- Validação de campos obrigatórios antes da movimentação (Regra de Negócio 5).

---

### [Componente 4] Campanhas e Geração de Mensagens IA

Módulo central de inteligência do sistema.

#### [NEW] [generate-message.ts](file:///c:/Users/vilan/SDR%20CRM/supabase/functions/generate-message/index.ts) (Edge Function)
- Recebe contexto do lead e da campanha.
- Chama a API da LLM.
- Retorna 2 a 3 variações de mensagens.

#### [NEW] [CampaignForm.tsx](file:///c:/Users/vilan/SDR%20CRM/src/components/campaigns/CampaignForm.tsx)
- Configuração de prompts, contexto e **etapa gatilho**.

---

### [Componente 5] Gatilhos e Automação (Diferencial)

Lógica assíncrona para geração automática.

#### [NEW] [handle-stage-change.ts](file:///c:/Users/vilan/SDR%20CRM/supabase/functions/handle-stage-change/index.ts) (Edge Function)
- Disparada via Webhook quando um lead muda de etapa.
- Verifica se há campanha vinculada à nova etapa e dispara a geração.

---

## Plano de Verificação

### Testes Automatizados
- Validação de RLS via testes unitários no Supabase.
- Testes de componentes UI com Vitest.

### Verificação Manual
- Fluxo completo: Cadastro -> Criar Lead -> Mover para Etapa Gatilho -> Verificar se mensagem apareceu automaticamente.
- Teste de bloqueio de etapa por falta de campos obrigatórios.
