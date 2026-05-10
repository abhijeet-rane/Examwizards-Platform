# Azure preview (optional, cost-efficient demos)

Terraform here provisions **nothing** unless you set `enable_azure = true` and provide credentials. Use this path for **public previews** (e.g. Container Apps + a small MySQL Flexible Server) without replacing the **AWS-first** production story documented in the root README.

## Typical preview pattern

1. Build the same **Docker** images used for AWS (API + optional SPA static to Blob/CDN).
2. Deploy API to **Azure Container Apps** or **App Service for Containers**.
3. Point **Vercel** or Azure Static Web Apps at the SPA build; set `VITE_API_BASE_URL` to the preview API URL.

## Commands

```bash
cd infra/azure/terraform
terraform init -backend=false
terraform fmt -recursive
terraform validate
```

Copy `terraform.tfvars.example` to `terraform.tfvars` (gitignored at repo level via `*.tfvars`) only when you intend to apply.
