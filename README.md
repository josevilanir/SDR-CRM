# SDR CRM + AI Automation

Um CRM especializado para equipes de Pré-Vendas (SDR) que utiliza Inteligência Artificial para hiper-personalizar o alcance de vendas em escala.

![Status do Projeto](https://img.shields.io/badge/Status-Finalizado-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Supabase%20%7C%20Gemini-blue)

---

## 🔗 Links do Projeto

- **Aplicação Publicada:** [https://sdr-crm-cyan.vercel.app/](https://sdr-crm-cyan.vercel.app/)
- **Vídeo de Apresentação:** [Assista no Google Drive](https://drive.google.com/file/d/1HmewAIi_xaSU524bW1N9-AFTeCJqnhIj/view?usp=drive_link)

---

## 📝 Descrição do Projeto

Este projeto é um Mini CRM para equipes de SDR (Sales Development Representatives) com foco em geração de mensagens personalizadas via IA. O sistema permite organizar leads em um funil Kanban, configurar campanhas com contexto e tom de voz, gerir uma equipe multi-usuário e gerar automaticamente sugestões de abordagem personalizadas para cada lead com base nos dados cadastrados.

---

## 🚀 Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Estilização | Tailwind CSS v4 |
| Drag and Drop | @dnd-kit/core (com suporte a Touch/Mobile) |
| Backend | Supabase Edge Functions (Deno runtime) |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Inteligência Artificial | Google Gemini 2.5 Flash |
| Versionamento | Git + GitHub |
| Deploy | Vercel |

---

## 🧠 Decisões Técnicas

### Estrutura do Banco de Dados
O banco de dados foi modelado para suportar **Multi-tenancy Isolado por Workspace**:
- **Triggers e RPCs**: Utilizamos Procedures (RPC) para garantir a atomicidade na criação de novos workspaces e perfis de usuários.
- **JSONB para Flexibilidade**: As regras de transição de etapas e obrigatoriedade de campos são armazenadas em colunas JSONB, permitindo que a lógica de negócio evolua sem a necessidade de migrações complexas de esquema a cada mudança.

### Integração com LLM (IA)
A integração utiliza **Supabase Edge Functions** como camada intermediária segura:
- **Segurança**: A chave de API do Gemini nunca é exposta no frontend.
- **Prompt Engineering**: Estruturamos os prompts para incluir não apenas os dados do lead, mas o contexto da campanha e o tom de voz desejado, garantindo que a IA gere mensagens altamente relevantes e prontas para uso.

### Multi-tenancy
O isolamento de dados é garantido via **Row Level Security (RLS)** no PostgreSQL:
- Cada tabela possui políticas que verificam o `workspace_id` vinculado ao usuário autenticado. 
- Implementamos um sistema de **Convites por Código**, permitindo que múltiplos usuários colaborem no mesmo workspace mantendo o isolamento total entre diferentes empresas.

### Desafios Encontrados e Soluções
1. **Responsividade no Kanban**: Kanban boards são desafiadores em telas pequenas. Resolvemos implementando rolagem horizontal fluida e adaptando os modais para visualização em tela cheia no mobile.
2. **UX de Cadastro**: Para evitar o problema de usuários "sem nome", movemos a coleta do nome completo para o fluxo de registro inicial e integramos com os metadados do Supabase Auth.
3. **Interação por Toque**: O arraste de leads no celular exigiu a implementação de um sensor de toque específico com *delay* para não interferir na rolagem natural da página.

---

## ✅ Funcionalidades Implementadas

### Obrigatórias
- [x] **Autenticação** — Cadastro e login via Supabase Auth (email/senha)
- [x] **Workspaces** — Criação de workspace, isolamento completo de dados por tenant
- [x] **Controle de acesso** — RLS no PostgreSQL garante que usuários acessem apenas seu workspace
- [x] **Gestão de Leads** — Cadastro com campos padrão e responsáveis
- [x] **Campos Personalizados** — Criação dinâmica de campos adicionais por workspace
- [x] **Kanban** — Visualização e movimentação de leads por etapas
- [x] **Regras de Transição** — Configuração de campos obrigatórios por etapa
- [x] **Dashboard** — Métricas em tempo real de leads e mensagens
- [x] **Criação de Campanhas** — Definição de contexto e tom de voz para a IA
- [x] **Geração de Mensagens com IA** — 3 variações personalizadas por lead

### Diferenciais (WOW Factors)
- [x] **Geração Automática (Gatilho)** — Mensagens geradas via Webhook ao entrar em etapas específicas
- [x] **Sistema de Convites** — Convide outros membros para seu workspace via código único
- [x] **Responsividade Mobile Total** — Layout 100% adaptado para celulares, incluindo Drag & Drop
- [x] **Perfil de Usuário** — Personalização de nome e identificação de membros da equipe
- [x] **Histórico de Mensagens** — Persistência das variações geradas para consulta futura

---

## 🛠️ Como Executar o Projeto

1. **Instalação**: `npm install`
2. **Ambiente**: Configure o `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. **Banco**: Aplique as migrations via Supabase CLI ou SQL Editor
4. **Execução**: `npm run dev`

---

## 🏗️ Estrutura do Banco de Dados

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

Desenvolvido por **Jose Vilanir** como projeto final para o desafio de SDR CRM com IA.
