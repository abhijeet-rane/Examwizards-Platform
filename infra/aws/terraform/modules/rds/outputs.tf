output "db_instance_id" {
  value = aws_db_instance.this.id
}

output "db_instance_arn" {
  value = aws_db_instance.this.arn
}

output "endpoint" {
  description = "RDS hostname for JDBC (without port)."
  value       = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "jdbc_url" {
  description = "Example JDBC URL — substitute credentials from Secrets Manager."
  value       = "jdbc:mysql://${aws_db_instance.this.address}:${aws_db_instance.this.port}/${aws_db_instance.this.db_name}"
}

output "security_group_id" {
  value = aws_security_group.rds.id
}

output "master_user_secret_arn" {
  description = "Secrets Manager ARN when manage_master_user_password is true."
  value       = try(aws_db_instance.this.master_user_secret[0].secret_arn, null)
}
