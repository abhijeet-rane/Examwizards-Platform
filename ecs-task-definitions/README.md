# ECS task definition templates

These JSON documents are **templates** for `aws ecs register-task-definition` or for embedding in Terraform `aws_ecs_task_definition` as `container_definitions` (often via `templatefile()`).

## Before use

1. Replace **`REPLACE_ACCOUNT_ID`**, **`REPLACE_REGION`**, and **`REPLACE_ECR_REPOSITORY_URI`** with your ECR image URI (same image the CI pipeline pushes).
2. Replace **log group** name if you use a different naming convention.
3. Map **Secrets Manager** ARNs for `DB_PASSWORD`, `JWT_SECRET`, Razorpay, and mail credentials — never bake secrets into the image.
4. Adjust **CPU** (512) and **memory** (1024) for your JVM heap and load tests.

## Health checks

Point the ALB target group and/or container `healthCheck` at a stable HTTP path your Spring app exposes publicly (for example a dedicated health controller consistent with your `SecurityConfig`).

## Files

| File | Role |
|------|------|
| `examwizards-api-task-definition.json` | Single-container Fargate task for the Spring Boot API |
