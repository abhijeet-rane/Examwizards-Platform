# Monitoring (AWS CloudWatch)

Recommended baseline (no live resources created from this folder):

| Concern | AWS artifact |
|---------|----------------|
| API errors | Metric filter on `ERROR` in `/ecs/examwizards-api` log group; alarm on threshold. |
| Latency | ALB `TargetResponseTime` p95 alarm. |
| Saturation | ECS CPU/memory utilization; RDS `CPUUtilization`, `FreeStorageSpace`. |
| Synthetics | Optional CloudWatch Synthetics canary against `/api/auth/health` (or your chosen path). |

Export dashboards as JSON when stable and store under `monitoring/dashboards/` if you want them versioned (optional).
