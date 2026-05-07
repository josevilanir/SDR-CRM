# Tasks: SDR CRM

## Fase 1: Setup e Infraestrutura
- [x] Inicializar projeto Vite + React + TypeScript + Tailwind
- [x] Configurar Supabase CLI e Migrations
- [x] Definir schema inicial de banco de dados
- [x] Configurar variáveis de ambiente (Supabase URL/Key)

## Fase 2: Autenticação e Multi-tenancy
- [ ] Implementar fluxo de Login/Cadastro
- [ ] Implementar lógica de Workspace (Criação/Seleção)
- [ ] Configurar políticas RLS para isolamento de dados

## Fase 3: Gestão de Leads
- [ ] Criar CRUD de Leads (Campos padrão)
- [ ] Implementar Kanban Board (Drag and Drop)
- [ ] Implementar sistema de campos personalizados dinâmicos
- [ ] Adicionar validação de campos obrigatórios por etapa

## Fase 4: Campanhas e IA
- [ ] Criar CRUD de Campanhas (Contexto, Prompt, Gatilho)
- [ ] Criar Edge Function para geração de mensagens via LLM
- [ ] Implementar interface de geração manual de mensagens no Lead

## Fase 5: Automação (Diferencial)
- [ ] Configurar Database Webhooks para mudança de etapa
- [ ] Implementar Edge Function de gatilho automático
- [ ] Testar geração em background

## Fase 6: Dashboard e Polimento
- [ ] Criar Dashboard de métricas (Leads por etapa, totais)
- [ ] Aplicar design premium (Glassmorphism, Animações)
- [ ] Finalizar documentação (README) e vídeo
