# CLAUDE.md

This file provides foundational guidance to Claude Code when working in any repository. Read it in full at the start of each session. The rules defined here establish the minimum quality standard expected.

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Only touch what's necessary. Avoid introducing side-effects.

---

## Stack Decision Framework

**Before writing a single line of code**, read the project requirements and map them to the correct stack from the options below. If the stack is already established (existing repo), respect it — do not introduce new technologies without discussing with the developer first.

### Decision Tree

**Step 1 — What type of project is this?**

```
Is it a landing page or marketing page?
  └─ Yes → go to Step 2 (Landing Page)
  └─ No  → go to Step 3 (Application)
```

**Step 2 — Landing Page**

| Signal                                              | Stack                      |
| --------------------------------------------------- | -------------------------- |
| Static content only, no user interaction            | Next.js (static export)    |
| Rich animations, scroll-driven effects, Apple-style | Next.js + Framer Motion    |
| Blog or content-heavy site                          | Next.js (App Router + MDX) |

> **Default for landing pages: Next.js + Vercel**. Do not reach for React + Vite here — Next.js provides SSG/SSR, SEO, and image optimization out of the box with zero extra config.

---

**Step 3 — Application: Does it need a separate frontend and backend?**

```
Does the project require:
  - A team with separate front/back responsibilities?
  - A mobile app consuming the same API later?
  - A public API for third-party consumers?
    └─ Yes to any → Decoupled (Step 4)
    └─ No        → Evaluate Monolith (Step 5)
```

**Step 4 — Decoupled (Separate Frontend + Backend)**

| Layer           | Stack                              | When                                      |
| --------------- | ---------------------------------- | ----------------------------------------- |
| Frontend        | **React + Vite**                   | SPAs, dashboards, complex interactive UIs |
| Backend         | **Node.js + Express + TypeScript** | REST APIs, business logic, integrations   |
| ORM             | Prisma                             | Always — type-safe, migrations, great DX  |
| Database        | PostgreSQL                         | Default relational choice                 |
| Auth            | JWT + bcryptjs                     | Stateless, scalable                       |
| Validation      | Zod                                | Schema validation on the API boundary     |
| Background jobs | BullMQ + Redis                     | Async tasks, scheduled cleanup, emails    |
| Deploy          | Vercel (front) + Fly.io (back)     | Default cloud targets                     |

> **Default for decoupled apps: React + Vite / Node.js + Express**

---

**Step 5 — Monolith: How complex is the domain?**

```
Is the project:
  - CRUD-heavy, domain-rich, or team-facing (internal tool, admin panel)?
    └─ Yes → Ruby on Rails (Step 6)
  - Simple, mostly static with minor server interaction?
    └─ Yes → Next.js with API routes (Step 7)
```

**Step 6 — Ruby on Rails Monolith**

Use when: rapid domain modeling matters more than API-first architecture.

| Concern         | Approach                                        |
| --------------- | ----------------------------------------------- |
| Views           | ERB / Hotwire + Turbo (avoid full SPA overhead) |
| Background jobs | Sidekiq + Redis                                 |
| Database        | PostgreSQL                                      |
| Auth            | Devise or custom JWT                            |
| Deploy          | Fly.io                                          |

> **Default for monoliths: Ruby on Rails**. Convention over configuration. Best productivity for solo or small teams building domain-heavy apps.

---

**Step 7 — Next.js with API Routes**

Use when: the app is mostly frontend-driven with light server needs (form submissions, simple data fetching, no complex business logic).

> If the backend logic starts growing beyond 3–4 routes, stop and evaluate whether a full decoupled Express backend is warranted.

---

### Python — When to Use It

Python is **not** part of the web application stack. Use it exclusively for:

| Use Case                           | Tooling                              |
| ---------------------------------- | ------------------------------------ |
| Data pipelines / ETL               | Python + Apache Spark / Pandas       |
| Scheduled scripts / automation     | Python + cron                        |
| Machine Learning / AI integrations | Python + FastAPI (as a microservice) |

> Never introduce Python for web APIs when Node.js + Express or Rails already covers the requirement.

---

### Quick Reference Table

| Project Type             | Frontend                | Backend           | Deploy          |
| ------------------------ | ----------------------- | ----------------- | --------------- |
| Landing page / marketing | Next.js + Framer Motion | —                 | Vercel          |
| SPA + REST API           | React + Vite            | Node.js + Express | Vercel + Fly.io |
| Domain-rich monolith     | Hotwire / ERB           | Ruby on Rails     | Fly.io          |
| Content site / blog      | Next.js (MDX)           | —                 | Vercel          |
| Data pipeline            | —                       | Python + Spark    | —               |
| ML microservice          | —                       | Python + FastAPI  | —               |

---

### Stack Already Defined? Respect It.

If the repository already has a framework in use, **do not suggest switching stacks mid-project**. Instead:

1. Work within the existing stack.
2. If a clear architectural problem exists, flag it to the developer with a reasoned proposal.
3. Only introduce a new dependency after the developer explicitly approves it.

---

## Available Skills

These skills are loaded automatically. Read the corresponding `SKILL.md` **before starting any task** that falls within a skill's domain — this is mandatory, not optional.

- **frontend-design**: [Skill Path](file:///C:/Users/vilan/claude-skills/frontend-design/SKILL.md)
- **brand-guidelines**: [Skill Path](file:///C:/Users/vilan/claude-skills/brand-guidelines/SKILL.md)
- **theme-factory**: [Skill Path](file:///C:/Users/vilan/claude-skills/theme-factory/SKILL.md)
- **design-an-interface**: [Skill Path](file:///C:/Users/vilan/claude-skills/design-an-interface/SKILL.md)
- **canvas-design**: [Skill Path](file:///C:/Users/vilan/claude-skills/canvas-design/SKILL.md)
- **web-artifacts-builder**: [Skill Path](file:///C:/Users/vilan/claude-skills/web-artifacts-builder/SKILL.md)
- **webapp-testing**: [Skill Path](file:///C:/Users/vilan/claude-skills/webapp-testing/SKILL.md)
- **skill-creator**: [Skill Path](file:///C:/Users/vilan/claude-skills/skill-creator/SKILL.md)
- **algorithmic-art**: [Skill Path](file:///C:/Users/vilan/claude-skills/algorithmic-art/SKILL.md)
- **claude-api**: [Skill Path](file:///C:/Users/vilan/claude-skills/claude-api/SKILL.md)
- **doc-coauthoring**: [Skill Path](file:///C:/Users/vilan/claude-skills/doc-coauthoring/SKILL.md)
- **docx**: [Skill Path](file:///C:/Users/vilan/claude-skills/docx/SKILL.md)
- **internal-comms**: [Skill Path](file:///C:/Users/vilan/claude-skills/internal-comms/SKILL.md)
- **mcp-builder**: [Skill Path](file:///C:/Users/vilan/claude-skills/mcp-builder/SKILL.md)
- **pdf**: [Skill Path](file:///C:/Users/vilan/claude-skills/pdf/SKILL.md)
- **pptx**: [Skill Path](file:///C:/Users/vilan/claude-skills/pptx/SKILL.md)
- **slack-gif-creator**: [Skill Path](file:///C:/Users/vilan/claude-skills/slack-gif-creator/SKILL.md)
- **xlsx**: [Skill Path](file:///C:/Users/vilan/claude-skills/xlsx/SKILL.md)

---

## Workflow

### 1. Research Before Acting (Consultative Approach)

- **Study First**: Before implementing complex backend features, study the existing architecture, dependencies, and project constraints.
- **Propose Improvements**: If a requirement (such as Redis, Docker, or Kafka) would benefit the project, **suggest it to the developer** with a technical rationale before acting.
- **Align with Goals**: Ensure every technical decision aligns with the developer's immediate needs and long-term vision.

### 2. Plan Before Implementing

- Enter plan mode for any non-trivial task (3+ steps or architectural decisions).
- Write the plan to `tasks/todo.md` with checkable items and confirm with the developer before starting implementation.
- If something goes sideways, stop and re-plan immediately — don't keep pushing.

### 3. Subagent Strategy

- Offload research, exploration, and parallel analysis to subagents to keep the main context window clean.
- One focused task per subagent.

### 4. Self-Improvement Loop

- After any correction from the user, update `tasks/lessons.md` with the learned pattern.
- Write rules that prevent the same mistake from recurring. Review lessons at session start.

### 5. Verification Before Done

- **Never** mark a task complete without proving it works: run tests, check logs, demonstrate correctness.
- Mark items complete in `tasks/todo.md` as you go, and add a result summary when finished.
- Ask: "Would a staff engineer approve this?"

### 6. Elegance Check

- For non-trivial changes, pause and ask: "Is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip for simple, obvious fixes.

### 7. Autonomous Bug Fixing

- When given a bug report, just fix it. Point at logs, errors, and failing tests, then resolve them.
- Fix failing tests without being told how.

---

## Backend Engineering Pillars

Use these five pillars as a framework to analyze the project and suggest improvements:

### Pillar 1: Fundamental Integrity

- Evaluate if the code relies too heavily on framework "magic".
- Propose moving towards a deeper understanding of HTTP, SQL execution, and system constraints when abstractions are causing issues.

### Pillar 2: Strategic Stack Enhancement

- **API Predictability**: Suggest moves toward idiomatic, versioned REST APIs.
- **Caching**: Analyze performance bottlenecks and propose **Redis** for expensive operations where appropriate.
- **Containerization**: Evaluate the benefits of **Docker** for environment parity and suggest implementation if it improves the dev/prod workflow.
- **Async Processing**: Identify heavy tasks and suggest offloading to **background jobs (BullMQ/Redis)** to improve response times.

### Pillar 3: Production-Ready Thinking

- **Observability**: Suggest adding structured logging and health metrics for critical features.
- **Security**: Propose hardening endpoints (JWT, stateless auth, input validation) as part of the implementation plan.
- **Profiling**: If performance is a concern, suggest a profiling phase before optimizing.

### Pillar 4: Architectural Evolution

- **Reliability**: Propose circuit breakers, retries, or better error boundaries for external integrations.
- **Scaling**: Evaluate if the system would benefit from message brokers (**Kafka**) or a microservices split, and discuss these "System Design" paths with the developer.

### Pillar 5: Technical Leadership

- **Quality & Consistency**: Propose refactors that maintain stylistic consistency and improve long-term maintainability.
- **Ownership**: Act as a partner in the project, focusing on real-world user impact and senior-level code standards.

---

## Code Best Practices

These practices apply to every project, frontend and backend, unless a specific stack makes them irrelevant.

### 1. Componentization

- Break the interface into small, reusable components with a single responsibility.
- Avoid monolithic "God Components".
- Base components (Button, Input, Card) must be reused throughout the project.
- Composite components are built by composing smaller ones.
- Components must be predictable and easy to test.

### 2. Separation of Concerns

- Every layer of the system must have a clear, defined purpose.
- On the frontend: separate UI, logic, and data access.
- On the backend: separate Controller, Service/UseCase, and Repository.
- UI components must not contain business rules.
- Well-organized code is easier to maintain, test, and evolve.

### 3. Database Modeling

- Model the database before writing code.
- Identify entities, attributes, and relationships.
- Use primary and foreign keys correctly.
- Avoid data duplication (normalization).
- The model must reflect the real business rules.

### 4. Migrations

- Migrations version the evolution of the database schema.
- Never alter migrations already applied in production.
- Create one migration per relevant change.
- They facilitate team collaboration and rollback of changes.

### 5. API Design

- An API is a clear and predictable contract.
- Use HTTP verbs correctly (GET, POST, PUT, DELETE).
- Use plural nouns in endpoints.
- Standardize responses and errors.
- Version the API from the start (`/api/v1`).

### 6. Layered Backend Architecture

- **Controller**: receives the request and returns the response.
- **Service/UseCase**: contains the business logic.
- **Repository**: handles database access.
- Entities represent the system's domain.
- Decoupled code is easier to test and refactor.

### 7. Backend Authentication

- Authentication confirms the user's identity.
- Use JWT for stateless authentication.
- Tokens must contain only essential information.
- Middlewares validate the token and control access.
- Authorization defines what each user is allowed to do.

### 8. Frontend Authentication

- The frontend consumes authentication from the backend.
- Use Context API for global auth state.
- Custom hooks encapsulate the logic.
- The UI reacts automatically to the authenticated state.
- Private routes protect sensitive screens.

### 9. Frontend Data Fetching

- Separate API calls from the UI layer.
- Use custom hooks to fetch data.
- Handle loading, error, and success states.
- Cancel requests when necessary.
- Avoid duplicating fetch logic.

### 10. Error Handling

- Errors must be handled in a centralized way.
- Never expose internal errors to the end user.
- Messages must be clear and user-friendly.
- The frontend must react correctly to failures.
- Logs are essential for debugging and monitoring.

### 11. Clean Code Design

- Small functions with clear names.
- Avoid code duplication.
- Prefer early returns.
- Code must be readable before being clever.
- Less complexity = fewer bugs.

### 12. Background Jobs

- Heavy tasks must not run in the request/response cycle.
- Use queues for asynchronous processing.
- BullMQ + Redis for jobs, retries, and delays.
- Workers execute tasks in the background.
- Ideal for emails, data cleanup, and heavy processing.

### 13. Domain-Driven Organization

- Group files by business context.
- Avoid overly generic folder names.
- Each domain has its own services and rules.
- Makes the project easier to understand and scale.

### 14. Project Structure as a Guide

- The project structure is an architectural decision.
- A good structure guides new developers.
- Helps maintain consistency across different projects.
- Serves as a reusable foundation for new systems.
