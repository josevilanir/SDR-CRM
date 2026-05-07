# Tasks: SDR CRM

## Fase 1: Setup e Infraestrutura
- [x] Inicializar projeto Vite + React + TypeScript + Tailwind
- [x] Configurar Supabase CLI e Migrations
- [x] Definir schema inicial de banco de dados
- [x] Configurar variáveis de ambiente (Supabase URL/Key)

## Fase 2: Autenticação e Multi-tenancy
- [x] Implementar fluxo de Login/Cadastro (UI Pronta, Lógica em andamento)
- [x] Implementar lógica de Workspace (Criação/Seleção)
  - WorkspaceProvider + useWorkspace hook (src/contexts/WorkspaceContext.tsx)
  - Tela de onboarding CreateWorkspace (src/pages/CreateWorkspace.tsx)
  - Roteamento workspace-aware no App.tsx
  - Sidebar com nome do Workspace e perfil (Layout.tsx)
  - RPC SECURITY DEFINER para criação atômica (supabase/migrations/20240508_workspace_rpc.sql)
- [ ] Aplicar migration 20240508_workspace_rpc.sql no Supabase (manual)

## Fase 3: Gestão de Leads
- [x] Criar CRUD de Leads (Campos padrão)
- [x] Implementar Kanban Board (Drag and Drop)
- [/] Implementar sistema de campos personalizados dinâmicos
- [ ] Adicionar validação de campos obrigatórios por etapa

## Fase 4: Campanhas e IA
- [x] Criar CRUD de Campanhas (Contexto, Prompt, Gatilho) — src/pages/Campaigns.tsx
- [x] Criar hook useCampaigns — src/hooks/useCampaigns.ts
- [x] Criar hook useCustomFields para campos personalizados — src/hooks/useCustomFields.ts
- [x] Implementar campos personalizados no LeadDetail (editar + adicionar)
- [x] Criar Edge Function generate-message com Gemini 1.5 Flash — supabase/functions/generate-message/index.ts
- [x] Implementar interface de geração: seletor de campanha, Gerar Sugestões, Copiar, Enviar (move para "Tentando Contato")
- [ ] Deployar Edge Function: supabase functions deploy generate-message
- [ ] Configurar GEMINI_API_KEY: supabase secrets set GEMINI_API_KEY=<sua-chave>

## Fase 5: Automação (Diferencial)
- [x] Criar Edge Function `handle-lead-automation` — supabase/functions/handle-lead-automation/index.ts
  - Recebe webhook INSERT/UPDATE de leads
  - Busca campanhas ativas com trigger_stage = novo status
  - Chama Gemini e salva 3 variações em `messages`
  - Anti-loop: ignora se já gerou nos últimos 5 min para o mesmo par lead+campanha
- [x] Gerar SQL de configuração do Database Webhook — supabase/webhook_setup.sql
  - Trigger `on_lead_status_change` na tabela `leads` (INSERT + UPDATE de status)
  - Requer: pg_net, substituir <YOUR_SUPABASE_URL> e <YOUR_SERVICE_ROLE_KEY>
- [x] Adicionar coluna `label` à tabela messages — supabase/migrations/20240509_messages_label.sql
- [x] Atualizar LeadDetail para exibir mensagens pré-geradas ao abrir o lead
  - Carrega mensagens `draft` do banco automaticamente
  - "Regenerar" permite gerar novas (substitui as antigas)
  - "Enviar" atualiza status da mensagem para `sent` e move lead para "Tentando Contato"
- [ ] Aplicar migration 20240509_messages_label.sql no Supabase (manual)
- [ ] Executar supabase/webhook_setup.sql no SQL Editor do Supabase (manual — substituir placeholders)
- [ ] Deployar Edge Function: `supabase functions deploy handle-lead-automation`

## Fase 6: Dashboard e Polimento
- [x] Criar Dashboard de métricas reais — src/pages/Dashboard.tsx
  - Total de Leads, Mensagens geradas pela IA, Etapas ativas
  - Gráfico de barras: Leads por Etapa (todas as 7 etapas do funil)
- [ ] Aplicar design premium (Glassmorphism, Animações)
- [ ] Finalizar documentação (README) e vídeo
