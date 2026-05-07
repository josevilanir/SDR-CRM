# Prova Técnica — SDR CRM com Gerador de Mensagens IA

## Contexto de Negócio
Equipes de SDR (Sales Development Representatives) precisam gerenciar leads e realizar abordagens personalizadas em escala. O sistema deve permitir:
- Organizar leads em um funil de pré-vendas
- Criar campanhas de abordagem com contextos específicos (ex: Black Friday, lançamento de produto)
- Gerar mensagens personalizadas usando IA, considerando os dados de cada lead

---

## Requisitos Funcionais

### 1. Autenticação e Workspaces ✅
- [x] Sistema de cadastro e login de usuários
- [x] Cada usuário deve poder criar um workspace (representa uma empresa/equipe)
- [x] Os dados (leads, campanhas, configurações) devem ser isolados por workspace
- [x] Implementar controle de acesso básico para que usuários só vejam dados do seu workspace

### 2. Gestão de Leads ✅
- [x] Cadastro de leads com campos padrão: nome, email, telefone, empresa, cargo, origem do lead, observações
- [x] Campos personalizados: criar campos adicionais para o workspace — disponíveis para todos os leads
- [x] Responsável pelo lead: atribuir um usuário do workspace (vínculo opcional)
- [x] Visualização em formato Kanban, organizados por etapas do funil
- [x] Possibilidade de mover leads entre etapas (drag and drop)
- [x] Visualização e edição dos detalhes do lead

### 3. Funil de Pré-Vendas ✅
Etapas implementadas:
- [x] Base — Lead recém cadastrado
- [x] Lead Mapeado — Informações preenchidas/enriquecidas
- [x] Tentando Contato — Em processo de abordagem
- [x] Conexão Iniciada — Primeiro contato realizado
- [x] Desqualificado — Sem fit/interesse
- [x] Qualificado — Potencial confirmado
- [x] Reunião Agendada — Próximo passo definido

### 4. Campanhas e Geração de Mensagens com IA ✅

#### 4.1 Criação de Campanhas ✅
- [x] Nome da campanha
- [x] Contexto (descrição da oferta, produto, empresa, condições, etc.)
- [x] Prompt de geração (persona, tom de voz, formato, exemplos, referência a campos do lead)
- [x] Etapa gatilho (vincula campanha a uma etapa para geração automática)

#### 4.2 Geração de Mensagens ✅
- [x] Selecionar campanha ativa
- [x] Gerar 3 variações de mensagens personalizadas (Direta, Consultiva, Provocativa)
- [x] Mensagens consideram: contexto da campanha + prompt + dados do lead (campos padrão e personalizados)
- [x] Regenerar mensagens a qualquer momento
- [x] Copiar mensagem para clipboard
- [x] Ação "Enviar" (simulado): move o lead automaticamente para "Tentando Contato"

#### 4.3 Geração Automática por Etapa Gatilho ✅ (diferencial)
- [x] Campanha vinculada a uma etapa gatilho
- [x] Database Webhook dispara Edge Function ao mover/criar lead na etapa
- [x] Mensagens geradas em background, salvas e associadas ao lead
- [x] Quando usuário abre o lead, mensagens já estão disponíveis
- [x] Guard anti-loop (evita geração duplicada em 5 minutos)
- [x] Suporte a múltiplas campanhas com a mesma etapa gatilho
- [x] Campos personalizados incluídos no contexto do prompt de automação

### 5. Regras de Transição entre Etapas ✅
- [x] UI de configuração: modal "Regras do Funil" com grade etapa × campo (checkboxes)
- [x] Campos padrão configuráveis: e-mail, telefone, empresa, cargo, origem, observações
- [x] Campos personalizados configuráveis: ícone ⚙ por campo define etapas onde é obrigatório (`is_required_at_stage` no DB)
- [x] Validação durante drag-and-drop: bloqueia movimentação com mensagem indicando campos faltantes
- [x] Regras persistidas no banco (`stage_transition_rules` jsonb em workspaces)
- [x] Regras padrão sensatas aplicadas antes do usuário configurar

### 6. Dashboard ✅
- [x] Quantidade de leads por etapa do funil (barra de progresso proporcional)
- [x] Total de leads cadastrados
- [x] Total de mensagens geradas pela IA
- [x] Número de etapas com leads ativos

---

## Requisitos Técnicos Obrigatórios ✅

| Camada | Requisito | Status |
|---|---|---|
| Frontend | React (Vibe Coding) | ✅ React 18 + Vite + TypeScript |
| Backend | Supabase Edge Functions (TS/JS) | ✅ 2 funções implementadas |
| Banco de Dados | Supabase (PostgreSQL) | ✅ 7 tabelas, 5 migrations |
| Autenticação | Supabase Auth | ✅ email/senha |
| Integração IA | API de LLM | ✅ Google Gemini 2.5 Flash |
| Versionamento | Git + GitHub | ✅ |

---

## Requisitos Diferenciais

- [x] Geração automática por gatilho (Implementado)
- [ ] Edição de funil (etapas customizadas) — Não implementado
- [ ] Multi-workspace — Não implementado
- [ ] Convite de usuários — Não implementado
- [x] Histórico de mensagens geradas (Implementado — salvas no banco por lead/campanha)
- [ ] Histórico de atividades — Não implementado
- [ ] Filtros e busca — Não implementado
- [ ] Métricas avançadas — Não implementado
- [x] Row Level Security (RLS) (Implementado)

---

## Entregáveis

- [x] Repositório GitHub com código-fonte completo
- [x] Documentação (README com descrição, tecnologias, decisões técnicas, desafios, checklist)
- [ ] Aplicação Publicada (Deploy — link a incluir)
- [ ] Apresentação em Vídeo (até 10 min — a gravar)

---

## Estrutura de Arquivos Relevante

```
src/
  pages/         Dashboard, Kanban, Campaigns, Login, CreateWorkspace
  components/
    leads/       KanbanBoard, KanbanColumn, LeadCard, LeadDetail,
                 AddLeadModal, StageRulesModal
  hooks/         useLeads, useCampaigns, useCustomFields, useStageRules
  contexts/      WorkspaceContext
  types/         index.ts (todas as interfaces)

supabase/
  migrations/    20240507_init, 20240508_workspace_rpc, 20240509_messages_label,
                 20240510_fix_rls, 20240511_drop_recursive_policy, 20240512_stage_rules
  functions/
    generate-message/       Geração manual de mensagens
    handle-lead-automation/ Automação por gatilho via webhook
```
