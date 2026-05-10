# ECS Fargate service module (placeholder)

Recommended composition:

0. (Optional) Use root module flag **`enable_ecs_cluster`** or see [`modules/ecs-cluster`](../ecs-cluster) for a minimal cluster resource.
1. `aws_ecs_cluster` with Container Insights enabled (`setting { name = "containerInsights" value = "enabled" }`).
2. `aws_ecs_task_definition` — family, CPU/memory, `requires_compatibilities = ["FARGATE"]`, `network_mode = "awsvpc"`, execution role (ECR pull, logs, secrets), task role (RDS, S3, SQS).
3. `aws_ecs_service` — desired count, `launch_type = "FARGATE"`, load balancer block pointing at ALB target group, subnets **private**, `assign_public_ip = false`, security group allowing **only** ALB → task port **8080**.
4. **Auto scaling** — `aws_appautoscaling_target` + CPU or request count policy.

Task definition JSON templates for manual registration live in the repository root folder **`ecs-task-definitions/`**.
