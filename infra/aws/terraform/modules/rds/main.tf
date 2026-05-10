resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnets"
  subnet_ids = var.db_subnet_ids

  tags = merge(var.tags, { Name = "${var.name_prefix}-db-subnets" })
}

resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds"
  description = "MySQL access for ${var.name_prefix}"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.allowed_security_group_ids
    content {
      description     = "MySQL from application"
      from_port       = 3306
      to_port         = 3306
      protocol        = "tcp"
      security_groups = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.name_prefix}-rds-sg" })
}

resource "aws_db_instance" "this" {
  identifier = "${var.name_prefix}-mysql"

  engine                = "mysql"
  engine_version        = var.engine_version
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage > var.allocated_storage ? var.max_allocated_storage : null
  storage_encrypted     = true
  storage_type          = "gp3"

  db_name  = var.db_name
  username = var.master_username

  manage_master_user_password = var.manage_master_user_password
  password                    = var.manage_master_user_password ? null : var.master_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az                = var.multi_az
  publicly_accessible     = var.publicly_accessible
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot
  backup_retention_period = var.backup_retention_period

  performance_insights_enabled          = var.enable_performance_insights
  performance_insights_retention_period = var.enable_performance_insights ? 7 : null

  apply_immediately = true

  tags = merge(var.tags, { Name = "${var.name_prefix}-mysql" })
}
