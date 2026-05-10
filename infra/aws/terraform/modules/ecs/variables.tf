variable "name_prefix" {
  type        = string
  description = "Prefix for ECS cluster, service, and IAM roles."
}

variable "vpc_id" {
  type        = string
  description = "VPC where ECS tasks run."
}

variable "ecs_subnet_ids" {
  type        = list(string)
  description = "Subnets for ECS tasks (private subnets recommended with NAT; public subnets only for dev with assign_public_ip)."
}

variable "assign_public_ip" {
  type        = bool
  description = "Assign public IP to tasks (true if using public subnets without NAT — dev/demo only)."
  default     = false
}

variable "alb_target_group_arn" {
  type        = string
  description = "ALB target group ARN from the alb module."
}

variable "alb_security_group_id" {
  type        = string
  description = "ALB security group ID — tasks accept traffic only from this SG."
}

variable "container_name" {
  type        = string
  description = "Container name in the task definition (must match load_balancer container_name)."
  default     = "api"
}

variable "container_image" {
  type        = string
  description = "ECR image URI including tag (e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com/examwizards-api:abc123)."
}

variable "container_port" {
  type        = number
  description = "Application listen port (Spring Boot default 8080)."
  default     = 8080
}

variable "cpu" {
  type        = number
  description = "Fargate CPU units (512 = 0.5 vCPU)."
  default     = 512
}

variable "memory" {
  type        = number
  description = "Fargate memory (MiB); must pair validly with cpu (see AWS docs)."
  default     = 1024
}

variable "desired_count" {
  type        = number
  description = "Number of tasks to run."
  default     = 1
}

variable "container_environment" {
  type        = map(string)
  description = "Plain environment variables for the container (non-secret)."
  default     = {}
}

variable "container_secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  description = "Secrets from Secrets Manager or SSM Parameter Store ARNs (requires execution role permissions)."
  default     = []
}

variable "enable_execute_command" {
  type        = bool
  description = "Enable ECS Exec for debugging (restrict with IAM in production)."
  default     = false
}

variable "deployment_minimum_healthy_percent" {
  type    = number
  default = 50
}

variable "deployment_maximum_percent" {
  type    = number
  default = 200
}

variable "tags" {
  type    = map(string)
  default = {}
}
