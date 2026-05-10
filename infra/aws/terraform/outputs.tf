output "aws_account_id" {
  description = "Current AWS account (from sts:GetCallerIdentity)."
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "Configured provider region."
  value       = data.aws_region.current.name
}

output "vpc_id" {
  description = "VPC ID when enable_vpc is true; otherwise null."
  value       = try(module.vpc[0].vpc_id, null)
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN when enable_ecs_cluster is true; otherwise null."
  value       = try(module.ecs_cluster[0].cluster_arn, null)
}

output "ecs_cluster_name" {
  description = "ECS cluster name when enable_ecs_cluster is true; otherwise null."
  value       = try(module.ecs_cluster[0].cluster_name, null)
}
