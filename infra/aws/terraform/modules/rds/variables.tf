variable "name_prefix" {
  type        = string
  description = "Prefix for RDS identifier and subnet group."
}

variable "vpc_id" {
  type        = string
  description = "VPC for the DB subnet group and security group."
}

variable "db_subnet_ids" {
  type        = list(string)
  description = "At least two subnets in different AZs (prefer private subnets for production)."
}

variable "allowed_security_group_ids" {
  type        = list(string)
  description = "Security groups that may connect to MySQL (typically ECS task SG from ecs module)."
}

variable "engine_version" {
  type        = string
  description = "MySQL major.minor for RDS (pin explicitly for prod)."
  default     = "8.0"
}

variable "instance_class" {
  type        = string
  description = "Startup-friendly default; scale vertically before heavy traffic."
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  type        = number
  description = "Initial allocated storage in GB (gp3)."
  default     = 20
}

variable "max_allocated_storage" {
  type        = number
  description = "Upper bound for storage autoscaling (0 disables autoscaling)."
  default     = 100
}

variable "db_name" {
  type        = string
  description = "Initial database name created on the instance."
  default     = "examwizards"
}

variable "master_username" {
  type        = string
  description = "Master username (cannot be reserved words)."
  default     = "examadmin"
}

variable "manage_master_user_password" {
  type        = bool
  description = "Let RDS store the master password in Secrets Manager (recommended)."
  default     = true
}

variable "master_password" {
  type        = string
  description = "Required only if manage_master_user_password is false."
  default     = null
  sensitive   = true
}

variable "multi_az" {
  type        = bool
  description = "Enable Multi-AZ for production HA (roughly doubles instance cost)."
  default     = false
}

variable "publicly_accessible" {
  type        = bool
  description = "Must be false for production; never expose RDS to the internet."
  default     = false
}

variable "skip_final_snapshot" {
  type        = bool
  description = "Set false for production data protection."
  default     = true
}

variable "deletion_protection" {
  type        = bool
  description = "Enable for production."
  default     = false
}

variable "backup_retention_period" {
  type        = number
  description = "Days of automated backups (0 disables; use >=7 for prod)."
  default     = 1
}

variable "enable_performance_insights" {
  type        = bool
  description = "Enable Performance Insights (extra cost; may not apply to all instance classes in every region)."
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
