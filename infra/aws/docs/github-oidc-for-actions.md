# GitHub Actions OIDC for Terraform on AWS

Use **OpenID Connect** so GitHub Actions can call **`terraform plan`** (and later **`apply`**) **without** long-lived AWS access keys.

## 1. Create an IAM OIDC identity provider (once per account)

If not already present:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

(Console: **IAM → Identity providers**, or Terraform `aws_iam_openid_connect_provider`.)

## 2. IAM role for GitHub Actions

Create a role **trusted** by `token.actions.githubusercontent.com` with a condition on your repository, for example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/Examwizards-Platform:*"
        }
      }
    }
  ]
}
```

Tighten `sub` to `ref:refs/heads/main` for apply jobs; use `pull_request` only for read-only `plan` in a **dedicated** role with **no** `iam:*` or `apply` rights if you want least privilege.

## 3. Permissions for `terraform plan`

Attach policies that allow **read** APIs used by your Terraform: EC2 (VPC), ECS, ELB, RDS describe, `sts:GetCallerIdentity`, etc. Start with **ReadOnlyAccess** in a **sandbox** account; narrow for production.

## 4. Wire the repository

In **GitHub → Settings → Secrets and variables → Actions → Variables**:

| Variable | Example | Purpose |
|----------|---------|---------|
| `TF_AWS_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-terraform-plan` | Role assumed by [`.github/workflows/terraform-plan-aws.yml`](../../../.github/workflows/terraform-plan-aws.yml) |
| `TF_AWS_REGION` | `us-east-1` | Optional; defaults to `us-east-1` in the workflow if unset |

If **`TF_AWS_ROLE_ARN`** is empty, the workflow prints a notice and skips **`terraform plan`** (CI still runs **`terraform validate`** in `ci.yml`).

## 5. Remote state

`terraform plan` in CI uses **`-backend=false`** by default in existing workflows. To **plan against real state**, configure a backend (S3 + DynamoDB lock) and pass **`-backend-config`** via secrets or generated files in a protected workflow—do not commit bucket names that embed secrets.

## References

- [AWS: Configuring OpenID Connect for GitHub](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [hashicorp/aws provider authentication](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
