# FounderFlow

Advanced README for the FounderFlow full‑stack CRM project.

## Project summary

FounderFlow is a full-stack Customer Relationship Management (CRM) application combining:
- TypeScript backend (Express/Vite server integration)
- React + Vite frontend with Tailwind CSS
- Shared types between client and server
- Postgres database access (Drizzle or similar ORM expected)
- Observability (Prometheus metrics endpoints)
- CI: GitHub Actions (CodeQL security analysis)
- Kubernetes overlays and deployment scripts

This README documents architecture, dev setup, build, testing, deployment and operational guidance.

---

## Screenshot

<p align="center">
  <img src="assets/app-screenshot.png" alt="FounderFlow UI screenshot" width="1000" />
</p>

_Figure: FounderFlow main dashboard (pipeline + reports)._

---

## Repository layout

- client/ — Vite + React frontend (TypeScript, Tailwind)
- server/ — Express + TypeScript HTTP server and API
- shared/ — shared types and utilities used by both client and server
- .github/workflows/ — CI workflows (CodeQL, etc.)
- k8s/ — Kubernetes overlays and deployment scripts
- tests/ — integration / load tests
- tsconfig.json — monorepo TypeScript config
- client/index.html — frontend entry

---

## Key concepts & architecture

- Monorepo using TypeScript path aliases:
  - "@/..." -> client/src/*
  - "@shared/..." -> shared/*
- Frontend served by Vite in dev; server can host static build in production.
- API surface: REST endpoints exposed by the server; metrics exposed for Prometheus.
- Database: Postgres (check server code for exact ORM/tooling). Migrations should be run before starting the server in prod.

---

## Prerequisites

- Node.js 18+ (Node 20 is used by CI)
- npm (or yarn/pnpm depending on project setup)
- PostgreSQL (local or remote)
- kubectl (for k8s deploy); optionally kustomize if scripts require it
- Optional: Docker for local containers

Windows notes: commands shown below assume PowerShell or Windows Terminal.

---

## Local development

1. Clone repository
   - git clone <repo> && cd FounderFlow

2. Install dependencies
   - Root monorepo (if root package.json exists):
     - npm ci
   - Per package:
     - cd client && npm ci
     - cd ../server && npm ci

3. Environment variables
   - Create `.env` files in server/ and client/ as required. Typical variables:
     - SERVER_PORT=3000
     - DATABASE_URL=postgres://user:pass@localhost:5432/dbname
     - JWT_SECRET=replace_me
     - NODE_ENV=development
     - VITE_API_BASE_URL=http://localhost:3000
   - Verify client and server ports do not conflict. Adjust Vite proxy if needed.

4. Start dev servers
   - In separate terminals (PowerShell):
     - cd server; npm run dev
     - cd client; npm run dev
   - Alternatively run from root if scripts are composed (npm run dev).

5. Build for production (one-time)
   - cd client; npm run build
   - cd server; npm run build (if server has build step)
   - The server typically serves the built `client/dist` directory.

---

## Scripts (common)

- npm run dev — run dev servers (client or server package)
- npm run build — build production assets
- npm test — run tests
- npm ci — clean install (CI-friendly)

Check package.json files in root, client, and server for exact script names.

---

## Database & migrations

- Database: PostgreSQL. Use DATABASE_URL env var.
- Migrations: check server/ for migration tooling (DrizzleKit, knex, prisma, etc.). Typical flow:
  - Run migrations: npm run migrate
  - Seed data: npm run seed

If your project uses Drizzle, use DrizzleKit commands; if Prisma, use prisma migrate.

---

## API & Endpoints

- Main API: /api/* (check server routes)
- Metrics: /metrics or /api/metrics (verify which endpoint the server exposes — tests and monitoring must match)
- Health: /health or /healthz (common pattern; verify presence)

Use Postman or curl to explore endpoints during development:
- curl http://localhost:3000/api/health
- curl http://localhost:3000/metrics

---

## Observability & metrics

- Prometheus metrics are exposed by the server. Confirm the exact path and protect it in production if needed.
- Configure Prometheus scrape job to target the metrics endpoint.
- Add logging and structured error handling for observability and SLOs.

---

## CI / Security

- GitHub Actions includes a CodeQL workflow (.github/workflows/codeql.yml).
- Review the workflow matrix and analyze step — ensure language and category are configured correctly (e.g., language: javascript).
- Ensure npm run build exists for the CI job that runs builds.

---

## Kubernetes deployment

- k8s/ contains overlays and scripts.
- deploy script expects kustomize or kubectl with kustomize enabled. On modern kubectl use `kubectl kustomize` fallback.
- Typical deploy:
  - kubectl apply -k k8s/overlays/staging
  - kubectl apply -k k8s/overlays/production

---

## Testing & load tests

- tests/ may contain integration and load tests.
- Ensure the tests target the correct metrics endpoint (consistently use /metrics or /api/metrics).
- Local testing:
  - Start server and run npm test
  - For load tests ensure BASE_URL is set: BASE_URL=http://localhost:3000 npm run load-test

---

## Common pitfalls & troubleshooting

- Tailwind dynamic classes: dynamically generated classes (e.g., `bg-${color}/5`) can be purged by Tailwind JIT. Use a safelist in tailwind.config or map colors to static class names in code.
- Error middleware: do not throw after sending a response. Ensure server error handler logs and returns without rethrowing to avoid process crash.
- TypeScript project references: tsconfig sets noEmit true for dev; confirm build pipeline produces compiled server output if required for production.
- Metrics endpoint mismatch: tests and monitoring may reference different paths; unify.

---

## Contributing

- Follow TypeScript strict mode and existing lint rules.
- Add unit/integration tests for new routes and features.
- Use feature branches and PRs. CI will run CodeQL and test suites.

---

## Release & deploy checklist

- Update version and changelog.
- Run migrations in staging before production.
- Build client assets and verify server static serving.
- Confirm monitoring and alerts are functional after deploy.

---

## Security & secrets

- Do not commit credentials or .env files.
- Use GitHub Secrets / Kubernetes secrets for production configuration.
- Rotate JWT secrets, DB credentials and keys periodically.

---

## Useful commands (Windows PowerShell)

- Install deps: npm ci
- Start server: cd server; npm run dev
- Start client: cd client; npm run dev
- Build client: cd client; npm run build
- Apply k8s overlay: kubectl apply -k .\k8s\overlays\staging

---

## Contact & further reading

- Inspect server/index.ts for route registration, Vite integration, and error handling.
- Inspect client/index.html and client/src for app entry and font loading.
- Review .github/workflows/codeql.yml for CI details.

License: check repository LICENSE file.
