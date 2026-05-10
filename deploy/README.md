# Deployment runbooks

| Artifact | Use |
|----------|-----|
| [`scripts/push-ecr.example.sh`](scripts/push-ecr.example.sh) | Tag and push the API image to ECR after local or CI build. |
| [`../ecs-task-definitions/`](../ecs-task-definitions/) | Register/update Fargate task definitions. |
| [`../infra/aws/terraform/`](../infra/aws/terraform/) | Plan/apply VPC, ECS, ALB, RDS when modules are extended. |

## Promotion model

1. **Build** immutable image digest in CI (GitHub Actions or Jenkins).  
2. **Push** to environment-scoped ECR tags (`dev`, `staging`, `prod` or digest-only).  
3. **Update** ECS service with new task definition revision (Terraform or `aws ecs update-service`).  
4. **Verify** ALB target health and CloudWatch error rate before promoting.

No live environment is implied by these files; they are **implementation-oriented** templates.
