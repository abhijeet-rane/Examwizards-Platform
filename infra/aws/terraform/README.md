# AWS Terraform — quick reference

```bash
cd infra/aws/terraform
terraform init -backend=false
terraform fmt -recursive
terraform validate
```

- **`enable_vpc`**: leave `false` in CI and for cost-free validation; set `true` only when you are ready to create VPC + subnets.
- **`enable_ecs_cluster`**: leave `false` until you deploy Fargate services; set `true` to create an ECS cluster (Container Insights on; small ongoing cost).
- **Remote state**: copy `backend.tf.example` to `backend.tf` only after you create the S3 bucket and DynamoDB lock table (do not commit `backend.tf` if it contains account-specific names — prefer environment-specific repos or CI-generated files).

Module README stubs: `modules/alb`, `modules/ecs`, `modules/rds`. Optional implementable module: `modules/vpc`, `modules/ecs-cluster`.