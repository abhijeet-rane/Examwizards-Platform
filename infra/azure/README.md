# Azure preview deployment (Terraform)

This folder provisions a **low-cost preview stack** on Azure:

- Resource group  
- **Azure Database for MySQL — Flexible Server** (Burstable `B_Standard_B1ms` by default) + application database  
- One **Linux App Service Plan** (`B1` by default) hosting **two** web apps: **Spring Boot API** and **Node chatbot**  
- Firewall rules for Azure services + optional developer IPs  

Nothing is created unless `enable_azure = "true"` in `terraform.tfvars`.

---

## What you need before starting

1. **Azure account** with an active subscription (e.g. Student / credits).  
2. **Rights** to create resource groups, MySQL Flexible Server, and App Service resources in that subscription.  
3. **Tools installed locally** (or use GitHub Actions later):  
   - [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.5`  
   - [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (`az`)  
4. **Repo cloned** and terminal open at the repository root (or `infra/azure/terraform`).  

---

## Step 1 — Sign in to Azure

```bash
az login
```

List subscriptions and copy the subscription ID you want to use:

```bash
az account list --output table
az account set --subscription "<subscription-id>"
```

Optional: register required resource providers (usually already registered):

```bash
az provider register --namespace Microsoft.DBforMySQL --wait
az provider register --namespace Microsoft.Web --wait
```

---

## Step 2 — Choose names that are globally unique

Azure App Service names must be **globally unique** as hostnames (`*.azurewebsites.net`).

In `terraform.tfvars`, set `project_name` to something short and unique, for example `ew-prev-youralias`. Terraform will create:

- `ew-prev-youralias-api`  
- `ew-prev-youralias-chatbot`  
- `ew-prev-youralias-mysql`  

If `terraform apply` fails with “name not available”, change `project_name` and apply again.

---

## Step 3 — Configure Terraform variables

```bash
cd infra/azure/terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit **`terraform.tfvars`**:

| Variable | What to set |
|----------|-------------|
| `enable_azure` | `"true"` when you are ready to create real resources |
| `location` | Region near you (e.g. `eastus2`) |
| `project_name` | Unique prefix (see above) |
| `frontend_url` | Your Vercel URL, e.g. `https://your-project.vercel.app` (used as `FRONTEND_URL` on the API) |
| `developer_ip_allowlist` | Optional list of your public IPs to allow direct MySQL access from tools on your laptop |
| `genai_api_key` | Optional; if set, Terraform writes `GENAI_API_KEY` to the **chatbot** web app settings |

**Secrets:** `terraform.tfvars` is gitignored. Do not commit it.

---

## Step 4 — Initialize Terraform

From `infra/azure/terraform`:

```bash
terraform init
```

For a **local state file** (fine for personal preview), use default backend. For **team / CI**, configure a remote backend (Azure Storage, Terraform Cloud) separately — not covered here.

---

## Step 5 — Format and validate (recommended)

```bash
terraform fmt -recursive
terraform validate
```

---

## Step 6 — Plan the infrastructure

```bash
terraform plan -out=tfplan
```

Review the plan: resource group, MySQL server + database + firewall rules, App Service plan, two Linux web apps.

---

## Step 7 — Apply (create Azure resources)

```bash
terraform apply tfplan
```

Or interactively:

```bash
terraform apply
```

**Duration:** MySQL Flexible Server can take **15–30+ minutes** on first create.

---

## Step 8 — Save Terraform outputs

After apply succeeds:

```bash
terraform output
terraform output -raw mysql_admin_password
```

Outputs include:

- `api_url` — base URL for the API (`https://…azurewebsites.net`)  
- `chatbot_url` — base URL for the chatbot  
- `vite_env_hint` — suggested `VITE_API_BASE_URL` and `VITE_CHATBOT_API_URL` for Vercel  
- `mysql_fqdn`, database name, admin user  
- Sensitive **MySQL password** (rotate later if you paste it into tickets or chat logs)

Terraform stores the random MySQL password in **state**. Protect `terraform.tfstate` accordingly.

---

## Step 9 — Add application secrets on the API (not created by Terraform)

The API web app gets **database** settings and **`FRONTEND_URL`** from Terraform. You still need **JWT**, email, payments, etc., consistent with `backend` configuration.

Using Azure CLI (replace names):

```bash
RESOURCE_GROUP="<from terraform output resource_group_name>"
API_APP="<project_name>-api"

az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$API_APP" --settings \
  JWT_SECRET="<long-random-secret>" \
  EMAIL_USERNAME="<your-smtp-user>" \
  EMAIL_PASSWORD="<your-smtp-password>" \
  EMAIL_FROM="<display>" \
  EMAIL_ENABLED="true" \
  EMAIL_ADMIN="<admin-email>"
```

Restart the API:

```bash
az webapp restart --resource-group "$RESOURCE_GROUP" --name "$API_APP"
```

Adjust names and variables to match your `application.properties` usage.

---

## Step 10 — Deploy the Spring Boot API

Terraform creates an empty **Java 17** Linux web app. You must deploy your **JAR**.

Typical flow:

1. Build locally from repo root:

   ```bash
   cd backend
   ./mvnw -B package -DskipTests
   ```

   Note the path to `target/*.jar`.

2. Zip deploy (Azure CLI):

   ```bash
   cd backend/target
   zip app.zip *.jar
   az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$API_APP" --src-path app.zip --type zip
   ```

3. Set **startup command** so Azure runs your Spring Boot JAR (adjust JAR name):

   ```bash
   az webapp config set --resource-group "$RESOURCE_GROUP" --name "$API_APP" \
     --startup-file "java -jar /home/site/wwwroot/*.jar"
   ```

   If wildcard fails, use the exact jar filename produced under `/home/site/wwwroot/` after deploy (check **SSH / Kudu** or redeploy with a fixed name like `app.jar`).

4. Confirm health:

   ```bash
   curl -s "https://${API_APP}.azurewebsites.net/api/auth/health"
   ```

   (Use your actual health endpoint if different.)

---

## Step 11 — Deploy the chatbot (Node)

Terraform creates a **Node 20** Linux web app. Install dependencies and start `server.js`.

**Important:** In Azure App Service, **`PORT`** is assigned by the platform. Your `server.js` already uses `process.env.PORT || 5000`, which is correct.

1. Package the chatbot **without** `node_modules`:

   ```bash
   cd chatbot
   zip -r ../chatbot-deploy.zip package.json package-lock.json server.js
   ```

   On Windows PowerShell you can use `Compress-Archive` for those files.

2. Deploy:

   ```bash
   CHATBOT_APP="<project_name>-chatbot"
   az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$CHATBOT_APP" --src-path ../chatbot-deploy.zip --type zip
   ```

3. Enable **Oryx build** on deploy so `npm install` runs (or upload `node_modules` — larger zip):

   ```bash
   az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$CHATBOT_APP" --settings \
     SCM_DO_BUILD_DURING_DEPLOYMENT=true \
     GENAI_API_KEY="<your-gemini-key>"
   ```

4. Startup command:

   ```bash
   az webapp config set --resource-group "$RESOURCE_GROUP" --name "$CHATBOT_APP" \
     --startup-file "node /home/site/wwwroot/server.js"
   ```

5. Test:

   ```bash
   curl -s "https://${CHATBOT_APP}.azurewebsites.net/health"
   ```

If `GENAI_API_KEY` was not set in Terraform, set it in the portal or CLI as above.

---

## Step 12 — Database schema

Terraform creates an empty database. Load schema the same way you do locally (Flyway/Liquibase if present, or SQL dump).

Optional: connect from your machine only if you added your IP to `developer_ip_allowlist`:

```bash
mysql -h "<mysql_fqdn>" -u "<mysql_admin_username>" -p --ssl-mode=REQUIRED
```

---

## Step 13 — Point Vercel at Azure

In the Vercel project (**Root directory**: `frontend`), set:

| Variable | Example |
|----------|---------|
| `VITE_API_BASE_URL` | `https://<project_name>-api.azurewebsites.net/api` |
| `VITE_CHATBOT_API_URL` | `https://<project_name>-chatbot.azurewebsites.net` |

Redeploy the frontend so Vite embeds these values.

---

## Step 14 — CORS / frontend URL

Spring Boot should allow your Vercel origin. This repo has **`WebConfig`** with localhost-only patterns; for production preview you should extend allowed origins to include your Vercel URL or align with `FRONTEND_URL`. Deploy an updated API after changing Java config.

The chatbot uses permissive CORS in Node; tighten later if needed.

---

## Step 15 — Day-2 operations

- **Logs:** Azure Portal → Web App → **Log stream** / Application Insights (optional add-on).  
- **Cost:** Delete the resource group when not demoing to stop compute charges (MySQL storage may still bill until deleted).  

```bash
terraform destroy   # after enabling destroy in lifecycle if you locked resources
```

Or delete **`${project_name}-rg`** in the portal.

---

## Troubleshooting

### `403 RequestDisallowedByAzure` (region not allowed)

**Cause:** **Azure for Students** (and similar offers) attach a policy such as **“Allowed resource deployment regions”**. The list is **different per subscription** — guessing `centralindia` or `eastus2` often fails.

**Step A — Get the exact region names Azure allows for *you***

1. Open [Azure Portal](https://portal.azure.com) → **Subscriptions** → select **your subscription** (the one Terraform uses).  
2. Left menu → **Policy** (under *Settings*).  
3. Open **Assignments** (or **Compliance** and drill into assignments).  
4. Find an assignment whose policy is **Allowed locations**, **Allowed locations for resource groups**, or **Allowed resource deployment regions**.  
5. Open it → **Parameters** / **Edit** and read the **list of allowed locations** (e.g. `East US`, `West Europe`, `Central India`).  

**Step B — Map portal names → Terraform `location` values**

Use the **lowercase, no-space** form (azurerm convention), for example:

| Portal / policy label | `location` in `terraform.tfvars` |
|----------------------|----------------------------------|
| East US | `eastus` |
| West US 2 | `westus2` |
| West Europe | `westeurope` |
| North Europe | `northeurope` |
| Central India | `centralindia` |
| South India | `southindia` |
| Southeast Asia | `southeastasia` |

Full list: [Azure geographies](https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/) (use the **Region** slug, e.g. `francecentral`).

**Step C — Fix Terraform and apply again**

1. Set **`location`** in **`terraform.tfvars`** to one value from **your** allowed list (must match a slug from the table above).  
2. Run **`terraform plan -out=tfplan`** then **`terraform apply tfplan`**.  
   - If only the resource group was created earlier, Terraform will create MySQL and the App Service plan in the **new** `location`.  
3. If you prefer a clean slate: **`terraform destroy`**, then set `location` and **`terraform apply`** again.

**CLI (optional):** After `az login`, you can inspect policy assignments at subscription scope; the allowed locations appear in the assignment parameters. Example starting point:

```bash
az policy assignment list --scope "/subscriptions/<YOUR_SUBSCRIPTION_ID>" -o table
```

### `genai_api_key` undeclared variable warning

Your `terraform.tfvars` references **`genai_api_key`** but the Terraform code in use does not define it. **Pull the latest repo** (this project declares `genai_api_key` in `variables.tf`) or **remove** the `genai_api_key = "..."` line from `terraform.tfvars` and set the key later in the Azure Portal for the chatbot Web App.

| Issue | What to check |
|-------|----------------|
| Apply fails on duplicate name | Change `project_name` |
| `403 RequestDisallowedByAzure` | Change `location` to an allowed region (see above) |
| API cannot reach MySQL | Firewall rule `AllowAzureServices`; JDBC URL SSL params |
| Chatbot exits / no GENAI | `GENAI_API_KEY` in chatbot app settings |
| Browser blocks API calls | CORS + correct `VITE_*` URLs (HTTPS) |

### `ProvisionNotSupportedForRegion` (MySQL Flexible Server)

**Cause:** **Azure Database for MySQL – Flexible Server** is not available in that region for your subscription/SKU (common on **Azure for Students** in some Indian regions).

**Fix:** In **`terraform.tfvars`**, set **`mysql_location`** to another region from your policy allowlist (often **`southeastasia`** or **`eastasia`** works). Keep **`location`** as your preferred region for App Service (e.g. **`centralindia`**). Example:

```hcl
location       = "centralindia"
mysql_location = "southeastasia"
```

Then **`terraform plan`** and **`terraform apply`**. The API connects to MySQL over the public hostname; cross-region adds a small latency but is fine for preview.

### MySQL firewall: `Provider produced inconsistent result` / API Web App `404`

If **`azurerm_mysql_flexible_server_firewall_rule`** for `0.0.0.0` fails or leaves Terraform state inconsistent, this repo **does not** manage that rule in Terraform anymore.

1. After a successful apply, run **`terraform output mysql_allow_azure_firewall_az_cli`** and execute the printed **`az mysql flexible-server firewall-rule create ...`** command once (requires Azure CLI).
2. If a failed apply left bad state for the old firewall resource, remove it from state and re-apply:

   ```bash
   terraform state rm 'azurerm_mysql_flexible_server_firewall_rule.allow_azure_services[0]'
   terraform apply
   ```

3. If **`examwizards-…-api`** Web App failed with **404** during create, run **`terraform apply`** again (often transient ARM); the updated config adds **`depends_on`** on the database and longer **`timeouts`** on the API app.

### `zone` cannot be changed independently (MySQL Flexible Server)

Azure assigns **`zone`** when the server is created. A later **`terraform apply`** may try to update it and Azure returns this error.

**Fix:** The Terraform module uses **`lifecycle { ignore_changes = [zone] }`** so Terraform leaves the zone as Azure created it. Pull latest **`main.tf`**, then **`terraform plan`** / **`apply`** again.

### Web App “already exists … needs to be imported”

After a **partial** or **failed** apply, **chatbot** or **api** might exist in Azure but **not** in Terraform state.

**Import chatbot** (replace subscription/RG/name if yours differ):

```bash
terraform import 'azurerm_linux_web_app.chatbot[0]' \
  "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>/providers/Microsoft.Web/sites/<project_name>-chatbot"
```

Example:

```bash
terraform import 'azurerm_linux_web_app.chatbot[0]' \
  "/subscriptions/01841f56-5dc1-486f-b327-618601cde029/resourceGroups/examwizards-prev-abhijeet-rg/providers/Microsoft.Web/sites/examwizards-prev-abhijeet-chatbot"
```

**Import API** (same pattern, `-api` suffix):

```bash
terraform import 'azurerm_linux_web_app.api[0]' \
  "/subscriptions/01841f56-5dc1-486f-b327-618601cde029/resourceGroups/examwizards-prev-abhijeet-rg/providers/Microsoft.Web/sites/examwizards-prev-abhijeet-api"
```

Then **`terraform plan`** — Terraform may show **updates** to align settings with your `.tf` files; review and **`apply`**.

---

## CI validation (no Azure credentials)

From repo root:

```bash
cd infra/azure/terraform
terraform init -backend=false -input=false
terraform validate
```

This matches the GitHub Actions job that validates Terraform syntax without applying.

---

## Automatic CD to Azure (main/master)

Workflow: **`.github/workflows/deploy-azure-preview.yml`**

On every push to `main`/`master` (or manual run), it:

1. Builds backend JAR and deploys to Azure Web App  
2. Validates chatbot source and deploys chatbot zip to Azure Web App

### Required GitHub configuration

Add these in your GitHub repository:

- **Repository Variables**
  - `AZURE_API_APP_NAME` (example: `examwizards-prev-abhijeet-api`)
  - `AZURE_CHATBOT_APP_NAME` (example: `examwizards-prev-abhijeet-chatbot`)
- **Repository Secrets**
  - `AZURE_WEBAPP_API_PUBLISH_PROFILE`
  - `AZURE_WEBAPP_CHATBOT_PUBLISH_PROFILE`

Publish profile secret values come from Azure Portal:
**Web App → Get publish profile** (download file, copy full XML).

### One-time chatbot setting

Because chatbot deploys source files (not prebuilt `node_modules`), ensure:

- `SCM_DO_BUILD_DURING_DEPLOYMENT=true` in chatbot app settings
