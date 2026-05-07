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
- [ ] Configurar Database Webhooks para mudança de etapa
- [ ] Implementar Edge Function de gatilho automático
- [ ] Testar geração em background

## Fase 6: Dashboard e Polimento
- [ ] Criar Dashboard de métricas (Leads por etapa, totais)
- [ ] Aplicar design premium (Glassmorphism, Animações)
- [ ] Finalizar documentação (README) e vídeo
