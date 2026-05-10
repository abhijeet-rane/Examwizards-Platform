# AWS (primary production architecture)

Terraform entry point: **[`terraform/`](terraform/)** (this folder — `infra/aws/terraform`).

## What you get in-repo

- **Composable modules** under [`terraform/modules/`](terraform/modules/) (VPC networking is optional and off by default to avoid accidental cost).
- **Root stack** in [`terraform/`](terraform/) wires `aws_caller_identity` and optional **VPC** and **ECS cluster** modules; extend with ALB, RDS, ElastiCache, WAF, and CloudFront as your account matures.
- **ECS task JSON templates** live in [`ecs-task-definitions/`](../../ecs-task-definitions/) for registration via `aws ecs register-task-definition` or Terraform `aws_ecs_task_definition`.

## Alignment with platform README

| Documented component | Repository support |
|---------------------|-------------------|
| VPC / subnets | [`modules/vpc`](terraform/modules/vpc) (optional, `enable_vpc`) |
| ECS Fargate | Optional cluster: [`modules/ecs-cluster`](terraform/modules/ecs-cluster) + `enable_ecs_cluster`; tasks/services: [`modules/ecs/README.md`](terraform/modules/ecs/README.md); JSON: [`ecs-task-definitions/`](../../ecs-task-definitions/) |
| ALB | [`modules/alb/README.md`](terraform/modules/alb/README.md) |
| RDS MySQL | [`modules/rds/README.md`](terraform/modules/rds/README.md) |
| ECR | [`deploy/scripts/push-ecr.example.sh`](../../deploy/scripts/push-ecr.example.sh), Jenkins / GHA |
| Secrets Manager | Task definition `secrets` placeholders in `ecs-task-definitions/` |
| CloudWatch | [`monitoring/`](../../monitoring/), [`observability/`](../../observability/) |
| SQS / Redis | Documented next to ECS/RDS modules; add resources when needed |

## Commands (local)

```bash
cd infra/aws/terraform
terraform init -backend=false
terraform fmt -recursive
terraform validate
```

For `plan`/`apply`, configure AWS credentials, a backend (S3 + DynamoDB lock), and copy `environments/dev/terraform.tfvars.example` to `terraform.tfvars` (gitignored).
