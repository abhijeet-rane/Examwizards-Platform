# ECS cluster module

Creates a single **ECS cluster** with **Container Insights** enabled.

Wire **Fargate services** and **task definitions** in a follow-on module or root stack once **VPC**, **ALB**, and **IAM** roles exist. The optional **`modules/ecs`** README describes service-level resources.

## Inputs

| Name | Description |
|------|-------------|
| `project_name` | Tagging / naming prefix |
| `environment` | dev, staging, prod |

## Outputs

- `cluster_arn`
- `cluster_name`
