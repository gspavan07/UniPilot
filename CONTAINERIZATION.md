# Containerization Overview (UniPilot)

This document explains how the UniPilot containers are built and wired together, with a focus on nginx and how this maps to Kubernetes deployment concerns.

## High-level architecture

The system is split into five services:

- Redis: shared cache/session store.
- Backend: Node.js API server.
- Main Frontend: SPA for `unipilot.in`.
- Exam Frontend: SPA for `exam.unipilot.in`.
- Edge Nginx: reverse proxy routing by hostname and path.

Traffic flow:

1. Public traffic hits the edge nginx container (port 80).
2. nginx routes by hostname:
   - `unipilot.in` -> main frontend container
   - `exam.unipilot.in` -> exam frontend container
3. `/api/` on either hostname is routed to the backend container.

## Why there are three nginx.conf files

There are three nginx configs because there are three nginx roles:

1. Edge reverse proxy (root `nginx.conf`)
   - Routes by hostname and `/api/` path.
   - Sits in front of all other services.

2. Main frontend static server (`UniPilot-Main/frontend/nginx.conf`)
   - Serves built SPA assets.
   - Provides SPA fallback with `try_files ... /index.html`.

3. Exam frontend static server (`UniPilot-ExamManagement/frontend/nginx.conf`)
   - Same as the main frontend, but for the exam app.

This separation makes each frontend container self-contained, which is helpful for independent builds and deployments. It is possible to consolidate into a single nginx in the future, but the current setup is valid.

## Docker build strategy

### Backend

- Image: `node:24-slim`
- Installs production dependencies and runs `npm start`.
- Exposes port `3000`.

Dockerfile: `UniPilot-Main/backend/Dockerfile`

### Frontends (Main + Exam)

Both frontends use a multi-stage build:

1. Build stage with `node:24-alpine` runs `npm run build`.
2. Runtime stage uses `nginx:alpine` to serve `dist/`.

Each image bundles its own nginx config to support SPA routing.

Dockerfiles:
- `UniPilot-Main/frontend/Dockerfile`
- `UniPilot-ExamManagement/frontend/Dockerfile`

## docker-compose (local orchestration)

The `docker-compose.yml` wires containers into a single network and exposes port 80 on the edge nginx.

Key points:

- `nginx` container maps `./nginx.conf` into `/etc/nginx/conf.d/default.conf`.
- `backend` is reachable via service name `unipilot-backend:3000`.
- Frontend containers are reachable via service names `unipilot-main-frontend:80` and `unipilot-exam-frontend:80`.
- Redis is exposed on the internal network only.

## Kubernetes mapping (suggested)

The current composition maps cleanly to Kubernetes primitives:

- 1 Deployment per service:
  - `redis`
  - `backend`
  - `main-frontend`
  - `exam-frontend`
  - `edge-nginx`

- 1 Service per Deployment (ClusterIP):
  - `redis`
  - `backend`
  - `main-frontend`
  - `exam-frontend`
  - `edge-nginx`

- 1 Ingress (or LB) that points to `edge-nginx`:
  - Host rules for `unipilot.in` and `exam.unipilot.in`.
  - Optional TLS termination at the Ingress.

Alternatively, you can skip the edge nginx and use an Ingress to route
`/api/` and the hostnames directly to the backend and frontend services.
In that model, the edge nginx Deployment can be removed.

## DNS and routing expectations

- `unipilot.in` -> public entry point (LB or Ingress)
- `exam.unipilot.in` -> same entry point

Routing decisions are based on host header and `/api/` path. This should
be preserved in Kubernetes (either in nginx or Ingress rules).

## Notes for the Kubernetes owner

- Ensure SPA fallback is preserved in the frontend nginx configs.
- If using Ingress directly for frontends, make sure `/` routes to the
  frontend Service and preserves client-side routing behavior.
- Backend expects `REDIS_HOST=redis` and `REDIS_PORT=6379`.
- The backend binds to port `3000`.

## Files to review

- Edge nginx: `nginx.conf`
- Main frontend nginx: `UniPilot-Main/frontend/nginx.conf`
- Exam frontend nginx: `UniPilot-ExamManagement/frontend/nginx.conf`
- Compose: `docker-compose.yml`
- Backend Dockerfile: `UniPilot-Main/backend/Dockerfile`
- Frontend Dockerfiles:
  - `UniPilot-Main/frontend/Dockerfile`
  - `UniPilot-ExamManagement/frontend/Dockerfile`
