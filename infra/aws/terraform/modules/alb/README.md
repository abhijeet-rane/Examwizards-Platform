# ALB module (placeholder)

Wire an **Application Load Balancer** in front of ECS Fargate tasks:

- `aws_lb` (application) in **public** subnets.
- `aws_lb_target_group` with **HTTP** or **HTTPS** listener and **health_check** path matching Spring Boot actuator or a dedicated `/api/health` route.
- `aws_lb_listener` forwarding to the target group attached to the ECS service.

Security: attach **AWS WAF v2** web ACL to the ALB for L7 rules; terminate TLS at the ALB with **ACM** in the same region.

Add a `modules/alb/` Terraform implementation when you are ready to `terraform apply` networking and compute together.
