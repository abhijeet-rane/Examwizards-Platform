output "alb_arn" {
  description = "Application Load Balancer ARN."
  value       = aws_lb.this.arn
}

output "alb_dns_name" {
  description = "DNS name for Route 53 alias or CloudFront origin."
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "Hosted zone ID for alias records."
  value       = aws_lb.this.zone_id
}

output "alb_security_group_id" {
  description = "Security group attached to the ALB (pass to ECS module as allowed source)."
  value       = aws_security_group.alb.id
}

output "target_group_arn" {
  description = "Target group ARN for the ECS service load_balancer block."
  value       = aws_lb_target_group.http.arn
}

output "listener_http_arn" {
  description = "HTTP listener ARN."
  value       = aws_lb_listener.http.arn
}

output "listener_https_arn" {
  description = "HTTPS listener ARN when enabled."
  value       = try(aws_lb_listener.https[0].arn, null)
}
