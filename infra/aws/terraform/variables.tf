variable "aws_region" {
  type        = string
  description = "AWS region for all regional resources."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Short name used for tagging and resource naming."
  default     = "examwizards"
}

variable "environment" {
  type        = string
  description = "Deployment stage: dev, staging, prod."
  default     = "dev"
}

variable "enable_vpc" {
  type        = bool
  description = "When true, provisions VPC module (public subnets). Extend with IGW/NAT/private subnets before production."
  default     = false
}

variable "enable_ecs_cluster" {
  type        = bool
  description = "When true, creates an ECS cluster with Container Insights (small ongoing cost). Disable until you deploy services."
  default     = false
}
