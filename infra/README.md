# Infrastructure layout

This repository separates **production-oriented AWS** assets from **cost-efficient preview** targets. Nothing here implies a live account or deployed stack unless you run Terraform and CI yourself.

| Path | Purpose |
|------|---------|
| [`aws/`](aws/) | **Primary** production path: Terraform for VPC (optional), ECS Fargate, ALB, RDS, supporting patterns documented in module READMEs. |
| [`azure/`](azure/) | **Preview**: optional Terraform for Azure Container Apps–style hosting; disabled by default (`enable_azure = "false"`). |
| [`../terraform/README.md`](../terraform/README.md) | Pointer to canonical AWS Terraform root under `infra/aws/terraform`. |
| [`../ecs-task-definitions/`](../ecs-task-definitions/) | Fargate task definition JSON templates (replace ARNs and image URIs). |
| [`../deploy/`](../deploy/) | Deployment runbooks and example scripts (ECR push, env promotion). |
| [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml) | CI: Maven, Vite, Terraform fmt/validate |
| [`../.github/workflows/terraform-plan-aws.yml`](../.github/workflows/terraform-plan-aws.yml) | PR **`terraform plan`** when **`TF_AWS_ROLE_ARN`** is set — see [`docs/github-oidc-for-actions.md`](aws/docs/github-oidc-for-actions.md) |
| [`../Jenkinsfile`](../Jenkinsfile) | Optional enterprise gate: build, scan, push registry, manual approval hooks. |

**Vercel** (static SPA preview) is configured under [`frontend/vercel.json`](../frontend/vercel.json). Point `VITE_API_BASE_URL` at your preview API (Azure or a tunnel to local/AWS dev).

**Do not** commit `terraform.tfvars`, `.env`, or state files containing secrets. Use `*.example` files only.
