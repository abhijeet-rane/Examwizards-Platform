# Docker — production-oriented notes

The **authoritative** Dockerfiles remain:

- `backend/Dockerfile` — multi-stage Maven build → Temurin JRE runtime.  
- `frontend/Dockerfile` — Vite build → Nginx static.  
- Root `Dockerfile` — combined demo/monolith layout for local demos.

## Production hardening checklist (apply in your fork when going live)

1. **Non-root user** in runtime images (`USER` directive after file copies).  
2. **No secrets in `ENV`** — inject at runtime from ECS task `secrets` / Kubernetes secrets.  
3. **Read-only root filesystem** where the runtime supports it (`readOnlyRootFilesystem` in ECS).  
4. **Distroless or Alpine** base images after compatibility testing with JNI/native deps.  
5. **Healthcheck** in Dockerfile or orchestrator-level checks aligned with Spring endpoints.

This folder holds **documentation only** so production guidance stays next to `docker-compose.yml` without duplicating Dockerfiles.
