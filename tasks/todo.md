# TODO - SDR CRM + AI Automation

## Fase 1: Setup e Infraestrutura
- [x] Inicializar projeto React + Vite + TS
- [x] Configurar Tailwind CSS v4 + Design System (Glassmorphism)
- [x] Configurar Cliente Supabase
- [x] Definir tipos globais (Lead, Workspace, Campaign)

## Fase 2: Autenticação e Multi-tenancy
- [x] Criar tabelas base (workspaces, profiles) com RLS
- [x] Implementar Fluxo de Login/Cadastro
- [x] Implementar Onboarding (Criação de Workspace via RPC)
- [x] Criar Contexto de Workspace e Proteção de Rotas

## Fase 3: Gestão de Leads (Kanban)
- [x] Criar tabelas de Leads e Field Definitions
- [x] Implementar Kanban Board com dnd-kit
- [x] Criar Modal de Adição de Lead
- [x] Criar Drawer de Detalhes do Lead (LeadDetail)
- [x] Implementar Hook `useLeads` para CRUD completo

## Fase 4: Integração com IA (Gemini 1.5 Flash)
- [x] Criar tabela de Campanhas e Mensagens
- [x] Implementar UI de Gestão de Campanhas
- [x] Criar Edge Function `generate-message` integrada ao Gemini
- [x] Implementar UI de Geração de Mensagem no LeadDetail
- [x] Configurar GEMINI_API_KEY no Supabase Secrets

## Fase 5: Automação (Diferencial)
- [x] Criar Edge Function `handle-lead-automation`
- [x] Configurar Database Webhooks (webhook_setup.sql)
- [x] Adicionar persistência de mensagens e suporte a variações (label)
- [x] Implementar lógica de Anti-loop e Gatilhos de Etapa

## Fase 6: Dashboard e Polimento
- [x] Criar Dashboard com métricas reais e gráficos
- [x] Aplicar polimento de UI (Transições, Hover states, Loading states)
- [x] Resolver erros de build (TypeScript, PostCSS)
- [x] Finalizar Documentação (README.md)

## Fase 7: Entrega
- [ ] Gravar vídeo de demonstração (10 min)
- [x] Subir código para o repositório final
