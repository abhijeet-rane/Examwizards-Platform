data "aws_region" "current" {}

locals {
  # ALB name_prefix max length is 6 characters (AWS constraint).
  lb_prefix = substr(replace(lower(var.name_prefix), "_", "-"), 0, 6)
}

resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb"
  description = "ALB ingress for ${var.name_prefix}"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = toset([80, 443])
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = var.allowed_ingress_cidrs
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-alb-sg" })
}

resource "aws_lb" "this" {
  name_prefix                = "${local.lb_prefix}-"
  load_balancer_type         = "application"
  internal                   = var.internal
  security_groups            = [aws_security_group.alb.id]
  subnets                    = var.public_subnet_ids
  enable_deletion_protection = var.enable_deletion_protection
  idle_timeout               = var.idle_timeout

  tags = merge(var.tags, { Name = "${var.name_prefix}-alb" })
}

resource "aws_lb_target_group" "http" {
  name_prefix = "${local.lb_prefix}-"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    matcher             = var.health_check_matcher
    protocol            = "HTTP"
  }

  deregistration_delay = 30

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-tg" })
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = "80"
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.enable_https_listener && var.certificate_arn != "" ? [] : [1]
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.http.arn
    }
  }

  dynamic "default_action" {
    for_each = var.enable_https_listener && var.certificate_arn != "" ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count = var.enable_https_listener && var.certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.this.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.http.arn
  }
}
