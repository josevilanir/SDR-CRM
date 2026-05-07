# SDR CRM + AI Automation

Um CRM especializado para equipes de Pré-Vendas (SDR) que utiliza Inteligência Artificial para hiper-personalizar o alcance de vendas em escala.

![Status do Projeto](https://img.shields.io/badge/Status-Finalizado-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Supabase%20%7C%20Gemini-blue)

---

## Descrição do Projeto

Este projeto é um Mini CRM para equipes de SDR (Sales Development Representatives) com foco em geração de mensagens personalizadas via IA. O sistema permite organizar leads em um funil Kanban, configurar campanhas com contexto e tom de voz, e gerar automaticamente sugestões de abordagem personalizadas para cada lead com base nos dados cadastrados.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Estilização | Tailwind CSS v4 |
| Drag and Drop | @dnd-kit/core |
| Backend | Supabase Edge Functions (Deno runtime) |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Inteligência Artificial | Google Gemini 2.5 Flash |
| Versionamento | Git + GitHub |

---

## Decisões Técnicas

### Estrutura do Banco de Dados

O banco de dados foi modelado em torno do conceito de **multi-tenancy por workspace**:

- `workspaces` — unidade principal de isolamento. Cada empresa/equipe tem seu próprio workspace
- `profiles` — usuários vinculados a workspaces com papéis (admin/member)
- `leads` — entidade principal com campos padrão e vínculo opcional a um responsável
- `field_definitions` — metadados de campos personalizados por workspace. Contém `is_required_at_stage` (jsonb) que mapeia quais etapas exigem o campo para transição
- `campaigns` — configurações de contexto, prompt de geração e etapa gatilho para IA
- `messages` — histórico de variações geradas, associadas ao lead e à campanha
- `stage_transition_rules` (em `workspaces`) — jsonb que armazena quais campos padrão são obrigatórios por etapa, configurável pelo usuário

A escolha de jsonb para `is_required_at_stage` e `stage_transition_rules` foi deliberada: regras por etapa têm estrutura variável e evoluem com o produto, o que torna colunas dinâmicas mais adequadas do que tabelas relacionais.

### Integração com LLM

A integração utiliza **Supabase Edge Functions** como camada intermediária segura — a chave de API do Gemini nunca é exposta no frontend. Há duas funções:

1. **`generate-message`** — chamada diretamente pelo frontend quando o usuário clica em "Gerar Sugestões". Recebe dados do lead (incluindo campos personalizados) e da campanha, constrói um prompt estruturado e retorna 3 variações de mensagem.

2. **`handle-lead-automation`** — ativada por Database Webhook (INSERT/UPDATE em `leads`). Quando um lead entra em uma etapa que possui campanha gatilho ativa, gera automaticamente as mensagens em background e salva no banco, já disponíveis quando o usuário abrir o lead.

O prompt engineering segue uma estrutura consistente: contexto da campanha → persona/tom de voz → dados completos do lead (campos padrão + personalizados) → instruções de formato + retorno JSON estrito.

### Multi-tenancy

O isolamento de dados é garantido em duas camadas:

1. **Row Level Security (RLS)** no PostgreSQL — cada tabela possui políticas que restringem acesso ao `workspace_id` do usuário autenticado, usando a função helper `get_my_workspace()`. Dados de um workspace nunca são acessíveis a usuários de outro.

2. **Lógica de aplicação** — todas as queries no frontend filtram explicitamente por `workspace_id` obtido do contexto de workspace.

### Arquitetura de Campos Personalizados

A tabela `field_definitions` define os campos adicionais do workspace, e `lead_custom_fields` armazena os valores por lead (relação `lead_id + field_definition_id`). Essa arquitetura Entity-Attribute-Value permite que cada workspace tenha um schema de dados diferente sem alterar o banco. Os campos personalizados são incluídos automaticamente nos prompts de IA.

### Desafios e Soluções

**Recursão infinita no RLS** — A política inicial em `profiles` causava recursão ao usar `auth.uid()` dentro de um subselect na própria tabela. Resolvido criando a função `get_my_workspace()` com `SECURITY DEFINER` e eliminando a política recursiva.

**Parsing de JSON do Gemini** — O modelo às vezes retorna markdown em volta do JSON (`\`\`\`json ... \`\`\``). Implementado um parser robusto que extrai o JSON de qualquer envoltório, com fallback que sanitiza caracteres de controle invisíveis antes de tentar novamente.

**Loop de automação** — O webhook de automação era acionado pelo próprio INSERT de mensagens (que atualiza indiretamente), causando gerações duplicadas. Resolvido com um guard anti-loop que verifica se mensagens foram geradas nos últimos 5 minutos para o mesmo par lead+campanha.

**Sincronização de campos personalizados entre leads** — Ao navegar entre leads no painel lateral, os valores de campos personalizados do lead anterior apareciam brevemente no novo. Resolvido limpando o estado de valores imediatamente antes do fetch e usando `useCallback` com `leadId` como dependência.

---

## Funcionalidades Implementadas

### Obrigatórias

- [x] **Autenticação** — Cadastro e login via Supabase Auth (email/senha)
- [x] **Workspaces** — Criação de workspace, isolamento completo de dados por tenant
- [x] **Controle de acesso** — RLS no PostgreSQL garante que usuários acessem apenas seu workspace
- [x] **Gestão de Leads** — Cadastro com campos: nome, e-mail, telefone, empresa, cargo, origem, observações
- [x] **Responsável pelo Lead** — Atribuição opcional de um membro do workspace como responsável
- [x] **Campos Personalizados** — Criação/remoção de campos adicionais por workspace, disponíveis para todos os leads
- [x] **Kanban** — Visualização de leads organizados por etapas do funil
- [x] **Drag and Drop** — Movimentação de leads entre etapas
- [x] **Detalhe do Lead** — Edição completa de dados, campos personalizados e geração de mensagens
- [x] **Funil com 7 etapas** — Base, Lead Mapeado, Tentando Contato, Conexão Iniciada, Desqualificado, Qualificado, Reunião Agendada
- [x] **Criação de Campanhas** — Nome, contexto da oferta, persona/tom de voz, etapa gatilho
- [x] **Geração de Mensagens com IA** — 3 variações personalizadas (direta, consultiva, provocativa)
- [x] **Regeneração de Mensagens** — O usuário pode gerar novas variações a qualquer momento
- [x] **Copiar / Enviar mensagem** — Copiar para clipboard; "Enviar" move o lead para "Tentando Contato"
- [x] **Regras de Transição** — Configuração de campos obrigatórios por etapa (campos padrão e personalizados)
- [x] **Dashboard** — Total de leads, leads por etapa (barra de progresso), total de mensagens geradas

### Diferenciais

- [x] **Geração Automática por Gatilho** — Database Webhook + Edge Function gera mensagens em background ao mover/criar lead na etapa gatilho
- [x] **Histórico de Mensagens Geradas** — Mensagens salvas no banco, associadas ao lead e à campanha, com label de variação
- [x] **Row Level Security (RLS)** — Políticas completas no Supabase garantindo isolamento de dados
- [ ] Edição de funil (etapas customizadas)
- [ ] Multi-workspace (usuário em múltiplos workspaces)
- [ ] Convite de usuários
- [ ] Histórico de atividades no lead
- [ ] Filtros e busca
- [ ] Métricas avançadas

---

## Como Executar

### Pré-requisitos
- Node.js 18+
- Conta Supabase + projeto criado
- Chave de API do Google AI Studio (Gemini)

### Configuração Local

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd sdr-crm
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   ```

4. Aplique as migrations no banco:
   ```bash
   npx supabase link --project-ref seu_project_ref
   npx supabase db push
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Deploy das Edge Functions

```bash
npx supabase functions deploy generate-message
npx supabase functions deploy handle-lead-automation
npx supabase secrets set GEMINI_API_KEY=sua_chave_gemini
```

### Configuração do Webhook de Automação

No painel do Supabase, crie um Database Webhook:
- Tabela: `leads`
- Eventos: `INSERT`, `UPDATE`
- URL: `<supabase_url>/functions/v1/handle-lead-automation`

---

## Estrutura do Banco de Dados

```
workspaces          — Unidade de isolamento (multi-tenant)
  └── profiles      — Usuários com papel (admin/member)
  └── leads         — Entidade principal de vendas
        └── lead_custom_fields  — Valores dos campos personalizados
  └── field_definitions         — Schema de campos adicionais do workspace
  └── campaigns     — Campanhas com contexto, prompt e gatilho
  └── messages      — Mensagens geradas pela IA
```

---

Desenvolvido como prova técnica para o desafio de SDR CRM com IA.
