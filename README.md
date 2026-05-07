# SDR CRM + AI Automation 🚀

Um CRM especializado para equipes de Pré-Vendas (SDR) que utiliza Inteligência Artificial para hiper-personalizar o alcance de vendas em escala.

![Status do Projeto](https://img.shields.io/badge/Status-Finalizado-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Supabase%20%7C%20Gemini-blue)

## 🌟 Diferenciais do Projeto

Este projeto vai além de um simples CRUD, implementando uma arquitetura moderna e funcionalidades de IA generativa:

- **Automação por Gatilhos (The "Magic" Flow)**: Ao mover um lead para uma etapa específica do Kanban, um *Database Webhook* dispara uma *Edge Function* que gera sugestões de mensagens automaticamente via Gemini 1.5 Flash.
- **Arquitetura Multi-tenant**: Isolamento total de dados entre diferentes empresas/workspaces usando *Row Level Security (RLS)* nativo do Postgres.
- **Campos Personalizados Dinâmicos**: Permite definir atributos específicos por workspace que a IA utiliza para contextualizar as mensagens.
- **UI/UX Premium**: Interface em Dark Mode com Glassmorphism, animações suaves e foco em produtividade.

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, Vite, TypeScript.
- **Estilização**: Tailwind CSS v4 (utilizando o novo motor de alto desempenho).
- **Backend/Banco**: Supabase (PostgreSQL).
- **Inteligência Artificial**: Google Gemini 1.5 Flash.
- **Infraestrutura**: Supabase Edge Functions (Deno runtime).

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Supabase CLI (opcional para deploy)
- Chave de API do Google AI Studio (Gemini)

### Configuração Local
1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` baseado no `.env.example`:
   ```env
   VITE_SUPABASE_URL=seu_projeto_url
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   VITE_GEMINI_API_KEY=sua_chave_gemini
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Deploy do Backend (Supabase)
Para habilitar a automação completa, é necessário realizar o deploy das funções:
```bash
npx supabase link --project-ref seu_project_id
npx supabase db push
npx supabase functions deploy generate-message
npx supabase functions deploy handle-lead-automation
npx supabase secrets set GEMINI_API_KEY=sua_chave
```

## 📈 Estrutura de Banco de Dados

O projeto utiliza uma estrutura relacional otimizada:
- `workspaces`: Unidade principal de isolamento.
- `profiles`: Usuários vinculados a workspaces.
- `leads`: Entidade principal de vendas.
- `field_definitions`: Metadados para campos customizados.
- `campaigns`: Configurações de contexto e gatilhos para a IA.
- `messages`: Histórico de variações geradas pela IA.

---
Desenvolvido como prova técnica para o desafio de SDR CRM com IA.
