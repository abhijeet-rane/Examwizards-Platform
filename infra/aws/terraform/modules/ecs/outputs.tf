output "cluster_id" {
  description = "ECS cluster ID / name."
  value       = aws_ecs_cluster.this.id
}

output "cluster_arn" {
  description = "ECS cluster ARN."
  value       = aws_ecs_cluster.this.arn
}

output "service_id" {
  value = aws_ecs_service.api.id
}

output "service_name" {
  value = aws_ecs_service.api.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.api.arn
}

output "task_execution_role_arn" {
  value = aws_iam_role.execution.arn
}

output "task_role_arn" {
  value = aws_iam_role.task.arn
}

output "task_security_group_id" {
  description = "Attach RDS SG ingress rules from this SG."
  value       = aws_security_group.tasks.id
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.api.name
}
