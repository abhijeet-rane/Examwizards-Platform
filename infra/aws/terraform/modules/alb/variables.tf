variable "name_prefix" {
  type        = string
  description = "Prefix for resource names (e.g. examwizards-dev)."
}

variable "vpc_id" {
  type        = string
  description = "VPC where the load balancer and target group are created."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "At least two public subnet IDs in different AZs for the internet-facing ALB."
}

variable "internal" {
  type        = bool
  description = "Set true for an internal ALB (e.g. behind another proxy). Most SaaS edge stacks use internet-facing = false for this var."
  default     = false
}

variable "container_port" {
  type        = number
  description = "Container port the target group forwards to (Spring Boot default 8080)."
  default     = 8080
}

variable "health_check_path" {
  type        = string
  description = "HTTP health check path; must match a route allowed without auth in the app (e.g. /api/auth/health)."
  default     = "/api/auth/health"
}

variable "health_check_matcher" {
  type        = string
  description = "ALB health check success codes (e.g. 200 for Spring, 200-299 if needed)."
  default     = "200"
}

variable "idle_timeout" {
  type        = number
  description = "ALB idle timeout in seconds (exams can be long-running; 60-300 is common)."
  default     = 120
}

variable "enable_deletion_protection" {
  type        = bool
  description = "Enable ALB deletion protection (use true in production)."
  default     = false
}

variable "allowed_ingress_cidrs" {
  type        = list(string)
  description = "CIDRs allowed to reach the ALB on 80/443. Use 0.0.0.0/0 for public web; restrict for admin-only endpoints."
  default     = ["0.0.0.0/0"]
}

variable "enable_https_listener" {
  type        = bool
  description = "When true, create HTTPS:443 listener (requires certificate_arn)."
  default     = false
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN in the same region as the ALB (for HTTPS listener)."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Extra tags applied to created resources."
  default     = {}
}
