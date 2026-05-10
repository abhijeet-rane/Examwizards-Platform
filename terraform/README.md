# Canonical Terraform (AWS)

The **production-oriented** Terraform root for this repository lives here:

**[`infra/aws/terraform/`](../infra/aws/terraform/)**

This top-level `terraform/` directory exists so common tooling and documentation patterns (`terraform/` at repo root) resolve clearly:

- **AWS**: implement and run `terraform` from `infra/aws/terraform/`.
- **Azure preview**: separate root at `infra/azure/terraform/` (optional, disabled by default).

Do not duplicate large modules between the two paths; keep AWS as the source of truth for networking and service patterns that you later mirror in preview environments.
