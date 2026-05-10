# RDS MySQL module (placeholder)

Production checklist:

- `aws_db_instance` engine **mysql**, **Multi-AZ** in prod, **storage_encrypted**, **KMS** key, **deletion_protection** enabled in prod.
- Subnets: `aws_db_subnet_group` using **private** subnets only.
- Security group: allow **3306** only from the **ECS task security group**.
- Credentials: **Secrets Manager** with `manage_master_user_password` (RDS-managed) or rotation Lambda; reference secret ARNs in ECS task definition.
- Backups: set `backup_retention_period`, test restore quarterly.

Add `modules/rds/` Terraform when networking and KMS policies are ready.
