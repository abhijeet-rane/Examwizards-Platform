# -----------------------------------------------------------------------------
# ExamWizards — AWS root stack (cost-safe defaults)
# Extend this file with aws_ecs_cluster, aws_lb, aws_db_instance, etc., or
# compose additional modules as your production rollout progresses.
# -----------------------------------------------------------------------------

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "vpc" {
  source = "./modules/vpc"
  count  = var.enable_vpc ? 1 : 0

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

module "ecs_cluster" {
  source = "./modules/ecs-cluster"
  count  = var.enable_ecs_cluster ? 1 : 0

  project_name = var.project_name
  environment  = var.environment
}
