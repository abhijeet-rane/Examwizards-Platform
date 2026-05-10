<div align="center">

# ExamWizards

**Online exams, courses, enrollments, and admin ops — Spring Boot API + React SPA**

[![License](https://img.shields.io/badge/License-Source%20Available-1a202c?style=flat-square)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7-6DB33F?style=flat-square&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-ea2d35?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

Backend-heavy · Docker-first · AWS-shaped · Terraform in-repo

[Architecture](#architecture) · [AWS topology](#aws-reference-topology) · [Infra](infra/README.md) · [Run locally](#local-development) · [License](#license)

</div>

ExamWizards is a role-based learning platform: instructors and admins manage courses and exams; students enroll, pay where needed, take timed assessments, and view results. The runtime is **Spring Boot + MySQL**, the client is **React (Vite)**, and workloads are packaged as **containers** with a production target on **AWS** (ECS Fargate, RDS, edge delivery, IaC under `infra/`).

> **Hosting:** Always-on public cloud was switched off after validation to save cost. The repo still reflects how you would ship it on AWS (Terraform, ECS task templates, CI). Demos can run via Docker Compose, lightweight Azure/Vercel previews, or a spare EC2 — pick what fits the budget.

---

## Stack

| Layer | Choices |
|-------|---------|
| API | Spring Boot 2.7, Java 17, Spring Security, JWT, JPA/Hibernate |
| UI | React 18, TypeScript, Vite, Tailwind, MUI, React Router 7 |
| Data | MySQL 8 (RDS-compatible); Flyway migrations in-repo; default config uses Hibernate `ddl-auto` — switch to managed migrations for prod |
| Integrations | Razorpay, Gmail SMTP, Google Gemini (`chatbot/` — Node service) |
| Containers | Multi-stage Dockerfiles, Compose, optional monolith `Dockerfile` |
| IaC | [`infra/aws/terraform`](infra/aws/terraform) (VPC / ECS cluster optional flags), [`infra/azure/terraform`](infra/azure/terraform) for cheap previews only |
| CI/CD | [GitHub Actions](.github/workflows/ci.yml), optional [Terraform plan on PR](.github/workflows/terraform-plan-aws.yml) with OIDC · [`Jenkinsfile`](Jenkinsfile) for registry pushes / approvals |

---

## Capabilities

**Students** — Catalog, enroll (free/paid), timed exams, submissions, results, leaderboard-style views.

**Instructors / admins** — Course CRUD (visibility, pricing), exam lifecycle, dashboards, user admin, contact inbox, review moderation.

**Platform** — Stateless REST under `/api/...`, one SPA client. Gemini chatbot lives outside the Spring process (`chatbot/`).

---

## Architecture

### Overview

```mermaid
flowchart TB
  subgraph UsersLayer[Users]
    direction LR
    B[Browser / mobile web]:::frontend
  end

  subgraph EdgeLayer[Edge and delivery]
    direction LR
    WAF[AWS WAF]:::security
    CF[CloudFront]:::cloud
  end

  subgraph AppLayer[Application]
    direction LR
    ALB[Application Load Balancer]:::cloud
    FE[SPA - S3 plus CloudFront]:::frontend
    API[Spring Boot - ECS Fargate]:::backend
  end

  subgraph DataLayer[Data and secrets]
    direction TB
    RDS[(RDS MySQL)]:::data
    CACHE[(ElastiCache Redis)]:::data
    OBJ[(S3 assets and uploads)]:::data
    SM[Secrets Manager]:::security
  end

  subgraph ObsLayer[Observability]
    CW[CloudWatch]:::devops
    LG[Dashboards and alarms]:::devops
  end

  B --> WAF --> CF
  CF --> FE
  CF --> ALB
  ALB --> API
  API --> RDS
  API --> CACHE
  API --> OBJ
  API --> SM
  API --> CW
  ALB --> CW
  FE --> CW
  CW --> LG

  classDef frontend fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px
  classDef backend fill:#ea580c,stroke:#c2410c,color:#fff,stroke-width:2px
  classDef data fill:#059669,stroke:#047857,color:#fff,stroke-width:2px
  classDef cloud fill:#7c3aed,stroke:#5b21b6,color:#fff,stroke-width:2px
  classDef security fill:#dc2626,stroke:#991b1b,color:#fff,stroke-width:2px
  classDef devops fill:#0891b2,stroke:#0e7490,color:#fff,stroke-width:2px
```

### AWS reference topology

Typical production slice: **Route 53 + ACM → CloudFront + WAF → ALB → ECS Fargate** (API), **S3** (static SPA), **RDS MySQL**, **ElastiCache**, **Secrets Manager**, **SQS** for async work, **ECR** for images, **CloudWatch** for logs/metrics. Terraform modules and stubs live under `infra/aws/terraform/`; nothing runs until you apply it.

```mermaid
flowchart TB
  subgraph DNS[DNS and TLS]
    R53[Route 53]:::cloud
    ACM[ACM certificates]:::security
  end

  subgraph VPC[VPC multi-AZ]
    subgraph PUB[Public subnets]
      NAT1[NAT GW AZ-a]:::cloud
      NAT2[NAT GW AZ-b]:::cloud
      ALB[Application Load Balancer]:::cloud
    end
    subgraph PRV[Private subnets compute]
      ECSa[ECS Fargate API AZ-a]:::backend
      ECSb[ECS Fargate API AZ-b]:::backend
    end
    subgraph DAT[Private subnets data]
      RDS[(RDS MySQL primary)]:::data
      STBY[(RDS standby Multi-AZ)]:::data
      RED[(ElastiCache Redis)]:::data
    end
  end

  subgraph EDGE[Edge]
    WAF[AWS WAF]:::security
    CF[CloudFront]:::cloud
    S3FE[S3 SPA static]:::frontend
  end

  subgraph ASYNC[Async]
    SQS[Amazon SQS]:::cloud
    WORK[ECS workers optional]:::backend
  end

  subgraph REG[Registry]
    ECR[Amazon ECR]:::devops
  end

  subgraph CFG[Config and secrets]
    SM[Secrets Manager]:::security
    SSM[SSM Parameter Store]:::cloud
  end

  subgraph OBS[Observability]
    CWL[CloudWatch Logs metrics]:::devops
    XR[X-Ray optional]:::devops
  end

  R53 --> ACM
  R53 --> CF
  CF --> WAF
  WAF --> S3FE
  WAF --> ALB
  ALB --> ECSa
  ALB --> ECSb
  ECSa --> RDS
  ECSb --> RDS
  RDS -. sync repl .-> STBY
  ECSa --> RED
  ECSb --> RED
  ECSa --> SQS
  ECSb --> SQS
  SQS --> WORK
  ECSa --> SM
  ECSb --> SM
  ECSa --> SSM
  ECSb --> SSM
  ECSa --> ECR
  ECSb --> ECR
  WORK --> ECR
  ECSa --> CWL
  ECSb --> CWL
  ALB --> CWL
  WORK --> CWL
  ECSa --> XR
  ECSb --> XR

  classDef frontend fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px
  classDef backend fill:#ea580c,stroke:#c2410c,color:#fff,stroke-width:2px
  classDef data fill:#059669,stroke:#047857,color:#fff,stroke-width:2px
  classDef cloud fill:#7c3aed,stroke:#5b21b6,color:#fff,stroke-width:2px
  classDef security fill:#dc2626,stroke:#991b1b,color:#fff,stroke-width:2px
  classDef devops fill:#0891b2,stroke:#0e7490,color:#fff,stroke-width:2px
```

### CI/CD

GitHub Actions builds backend + frontend and validates Terraform. Jenkins (optional) pushes images and can sit in front of manual promotion. ECR + ECS updates stay consistent if you promote **immutable digests** rather than floating `:latest` in prod.

```mermaid
flowchart LR
  subgraph DEV[Development]
    ENG[Engineers]:::frontend
    GH[GitHub PRs and main]:::devops
  end

  subgraph GHA[GitHub Actions CI]
    LINT[Lint and tests]:::devops
    BUILD_FE[Build frontend]:::frontend
    BUILD_BE[Build backend and scan]:::backend
    SCAN[Container scan Trivy ECR]:::security
  end

  subgraph IMG[Image registry]
    ECRD[ECR dev staging]:::cloud
    ECRP[ECR prod immutable]:::cloud
  end

  subgraph JK[Jenkins optional gate]
    APR[Approval SoD]:::security
    PROM[Promote digest]:::devops
    TFP[Terraform plan prod]:::devops
    TFA[Terraform apply]:::devops
  end

  subgraph CD[Delivery]
    STG[ECS staging]:::backend
    PRD[ECS production]:::backend
    MIG[DB migration job]:::data
  end

  ENG --> GH
  GH --> LINT --> BUILD_FE
  GH --> BUILD_BE
  BUILD_FE --> SCAN
  BUILD_BE --> SCAN
  SCAN --> ECRD
  ECRD --> STG
  STG -->|smoke and e2e| APR
  APR --> PROM
  PROM --> ECRP
  ECRP --> TFP --> TFA
  TFA --> PRD
  TFA --> MIG

  classDef frontend fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px
  classDef backend fill:#ea580c,stroke:#c2410c,color:#fff,stroke-width:2px
  classDef data fill:#059669,stroke:#047857,color:#fff,stroke-width:2px
  classDef cloud fill:#7c3aed,stroke:#5b21b6,color:#fff,stroke-width:2px
  classDef security fill:#dc2626,stroke:#991b1b,color:#fff,stroke-width:2px
  classDef devops fill:#0891b2,stroke:#0e7490,color:#fff,stroke-width:2px
```

### Security (AWS + app)

```mermaid
flowchart TB
  subgraph ID[Identity and access]
    IAM[IAM least privilege]:::cloud
    IRSA[Task execution role]:::cloud
    TASK[Task role app runtime]:::backend
    OIDC[GitHub OIDC to IAM]:::devops
  end

  subgraph NET[Network]
    SG[Security groups minimal paths]:::security
    PRIV[Private tasks NAT egress]:::cloud
    EP[VPC endpoints S3 ECR logs]:::cloud
  end

  subgraph EDGESEC[Edge security]
    WAF[AWS WAF rate limits]:::security
    CF[CloudFront TLS 1.2 plus]:::cloud
    ACM[ACM public certs]:::security
  end

  subgraph DATSEC[Data protection]
    RDSENC[RDS encryption KMS]:::data
    S3ENC[S3 SSE-KMS]:::data
    SM[Secrets Manager rotation]:::security
  end

  subgraph APPSEC[Application controls]
    JWT[JWT short TTL asymmetric option]:::backend
    RBAC[Spring Security RBAC]:::backend
  end

  subgraph GOV[Governance]
    CT[CloudTrail and Config]:::devops
    SSM[SSM Session Manager]:::cloud
  end

  IAM --> IRSA
  IAM --> TASK
  OIDC --> IAM
  WAF --> CF
  CF --> ACM
  CF --> SG
  SG --> PRIV
  EP --> PRIV
  TASK --> RDSENC
  TASK --> S3ENC
  TASK --> SM
  JWT --> RBAC
  IAM --> CT
  SSM --> IAM

  classDef frontend fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px
  classDef backend fill:#ea580c,stroke:#c2410c,color:#fff,stroke-width:2px
  classDef data fill:#059669,stroke:#047857,color:#fff,stroke-width:2px
  classDef cloud fill:#7c3aed,stroke:#5b21b6,color:#fff,stroke-width:2px
  classDef security fill:#dc2626,stroke:#991b1b,color:#fff,stroke-width:2px
  classDef devops fill:#0891b2,stroke:#0e7490,color:#fff,stroke-width:2px
```

At the app layer: JWT + RBAC, BCrypt, email verification on signup. In AWS: secrets in **Secrets Manager**, not in Git or env baked into images; TLS at the edge; tighten CORS from `*` when you deploy.

### Terraform workflow

Remote state belongs in **S3 + DynamoDB lock + KMS** — wire `infra/aws/terraform/backend.tf.example` when ready. CI `terraform validate` uses `-backend=false`; PR **`terraform plan`** runs when you set **`TF_AWS_ROLE_ARN`** ([OIDC doc](infra/aws/docs/github-oidc-for-actions.md)).

```mermaid
flowchart TB
  subgraph REM[Remote state]
    S3TF[S3 Terraform state]:::data
    DDB[DynamoDB state lock]:::data
    KMS[KMS state encryption]:::security
  end

  subgraph MOD[Terraform modules]
    VPCm[VPC subnets routing]:::cloud
    ECSm[ECS cluster services]:::backend
    RDSm[RDS MySQL]:::data
    EDGEm[CloudFront WAF]:::frontend
    IAMm[IAM OIDC for CI]:::security
    OBSm[CloudWatch dashboards]:::devops
  end

  subgraph WS[Workspaces]
    DEVw[dev]:::devops
    STGw[staging]:::devops
    PRDw[prod]:::devops
  end

  subgraph RUN[Execution]
    PLAN[terraform plan]:::devops
    APPLY[terraform apply protected]:::security
  end

  S3TF --> PLAN
  DDB --> PLAN
  KMS --> PLAN
  PLAN --> VPCm
  PLAN --> ECSm
  PLAN --> RDSm
  PLAN --> EDGEm
  PLAN --> IAMm
  PLAN --> OBSm
  VPCm --> DEVw
  ECSm --> STGw
  RDSm --> PRDw
  EDGEm --> PRDw
  IAMm --> PRDw
  OBSm --> PRDw
  PLAN --> APPLY

  classDef frontend fill:#2563eb,stroke:#1e40af,color:#fff,stroke-width:2px
  classDef backend fill:#ea580c,stroke:#c2410c,color:#fff,stroke-width:2px
  classDef data fill:#059669,stroke:#047857,color:#fff,stroke-width:2px
  classDef cloud fill:#7c3aed,stroke:#5b21b6,color:#fff,stroke-width:2px
  classDef security fill:#dc2626,stroke:#991b1b,color:#fff,stroke-width:2px
  classDef devops fill:#0891b2,stroke:#0e7490,color:#fff,stroke-width:2px
```

---

## AWS building blocks (quick map)

| Piece | Role |
|-------|------|
| VPC / subnets | Public (ALB, NAT) vs private (ECS, RDS, Redis) |
| ECS Fargate | Run the Spring Boot container; scale on CPU/RPS |
| ALB | TLS, routing, health checks to tasks |
| RDS MySQL | Primary store; Multi-AZ + backups in prod |
| ElastiCache | Cache / coordination |
| S3 + CloudFront | SPA assets, uploads, CDN |
| WAF + ACM | Edge rules and certs |
| Secrets Manager | DB creds, JWT material, vendor keys |
| SQS | Async jobs (mail, webhooks) |
| ECR | Images per env |
| CloudWatch | Logs, metrics, alarms |

---

## Local development

**Needs:** JDK 17, Node 20, Docker (recommended). MySQL via Compose or local install.

**Frontend**

```bash
cd frontend && npm ci && npm run dev
```

Set `VITE_API_BASE_URL` (e.g. `http://localhost:8080/api`). For Vercel previews, set the same in project env — see [`frontend/vercel.json`](frontend/vercel.json).

**Backend**

```bash
cd backend
chmod +x mvnw   # Unix/macOS once
./mvnw -B verify -DskipTests   # Unix/macOS — use mvnw.cmd on Windows
./mvnw spring-boot:run
```

Copy `.env.example` → `.env` with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, mail, Razorpay, Gemini, JWT.

**Full stack (Compose)**

```bash
cp .env.example .env   # edit values
docker compose up -d
```

Ports: MySQL **3306**, API **8080**, SPA **3000**.

---

## Deployment notes

**AWS (primary intent)** — Build/push API image to **ECR**, run **ECS Fargate** behind **ALB**, front with **CloudFront + WAF**, data in **RDS**, secrets in **Secrets Manager**, observe with **CloudWatch**. Terraform entry: [`infra/aws/terraform`](infra/aws/terraform). Flags like `enable_vpc` / `enable_ecs_cluster` default **off** so you do not accidentally bill networking.

**CI** — [`ci.yml`](.github/workflows/ci.yml): Maven wrapper build, Vite build, `terraform fmt`/validate. [`terraform-plan-aws.yml`](.github/workflows/terraform-plan-aws.yml): optional `terraform plan` on infra PRs when **`TF_AWS_ROLE_ARN`** is set.

**Jenkins** — [`Jenkinsfile`](Jenkinsfile): parameterized image build and registry push (Docker Hub or wire ECR).

**Cheap previews** — [`infra/azure/terraform`](infra/azure/terraform) creates nothing until `enable_azure = "true"`. SPA-only previews on Vercel point `VITE_API_BASE_URL` at whatever API you expose (Azure, tunnel, shared dev ALB).

**Artifacts** — Task definition template [`ecs-task-definitions/`](ecs-task-definitions/), ECR helper [`deploy/scripts/push-ecr.example.sh`](deploy/scripts/push-ecr.example.sh), nginx samples [`nginx/`](nginx/), ops notes [`monitoring/`](monitoring/), [`observability/`](observability/). Sample K8s YAML under `deployment/` / `services/` is experimental.

**Index:** [`infra/README.md`](infra/README.md)

---

## Repository layout

```text
Examwizards-Platform/
├── .github/workflows/     CI; optional Terraform plan (OIDC)
├── backend/               Spring Boot, Maven wrapper, Dockerfile
├── frontend/              Vite SPA, Dockerfile, vercel.json
├── chatbot/               Gemini helper (Node)
├── infra/
│   ├── aws/docs/        OIDC / Terraform PR plan
│   └── aws/terraform/   VPC & ECS cluster (optional); module stubs
├── infra/azure/terraform/   Preview-only (off by default)
├── terraform/             Points to infra/aws/terraform
├── ecs-task-definitions/  Fargate JSON templates
├── deploy/                ECR push example
├── nginx/                 Reverse-proxy snippets
├── docker/production/     Image hardening notes
├── monitoring/            CloudWatch guidance
├── observability/         Logs / metrics notes
├── docker-compose.yml
├── Dockerfile             Monolith-style demo image
├── Jenkinsfile
├── nginx.conf
├── .env.example / .env.template
├── LICENSE
└── README.md
```

---

## Screenshots

Drop images under `docs/screenshots/`.

---

## License

Source-available **proprietary** license — viewing and personal learning OK; **commercial use, redistribution, and resale** require **written permission**. See **[LICENSE](LICENSE)**.

Copyright (c) 2026 Abhijeet Rane.

---

## Author

**Abhijeet Rane** · [Docker Hub](https://hub.docker.com/u/abhijeetrane204) · [abhijeetrane204@gmail.com](mailto:abhijeetrane204@gmail.com)

Uses Spring Boot, React, Docker, and other OSS under their respective licenses.
