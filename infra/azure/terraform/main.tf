locals {
  enable = lower(var.enable_azure) == "true"
  # MySQL Flexible Server is not available in every allowed App Service region (e.g. some student subs + centralindia).
  mysql_location = var.mysql_location != "" ? var.mysql_location : var.location
  jdbc_url = local.enable ? format(
    "jdbc:mysql://%s:3306/%s?useSSL=true&requireSSL=true&serverTimezone=UTC",
    azurerm_mysql_flexible_server.main[0].fqdn,
    azurerm_mysql_flexible_database.app[0].name
  ) : ""
}

# -----------------------------------------------------------------------------
# Resource group
# -----------------------------------------------------------------------------
resource "azurerm_resource_group" "preview" {
  count    = local.enable ? 1 : 0
  name     = "${var.project_name}-rg"
  location = var.location
}

# -----------------------------------------------------------------------------
# MySQL Flexible Server (preview-sized)
# -----------------------------------------------------------------------------
resource "random_password" "mysql_admin" {
  count   = local.enable ? 1 : 0
  length  = 32
  special = true
}

resource "azurerm_mysql_flexible_server" "main" {
  count               = local.enable ? 1 : 0
  name                = "${var.project_name}-mysql"
  resource_group_name = azurerm_resource_group.preview[0].name
  location            = local.mysql_location

  administrator_login    = var.mysql_administrator_login
  administrator_password = random_password.mysql_admin[0].result

  sku_name = var.mysql_sku_name

  storage {
    size_gb = var.mysql_storage_gb
  }

  version = var.mysql_server_version

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  lifecycle {
    prevent_destroy = false
    # Azure sets availability zone at create time; later plans must not try to change zone alone.
    ignore_changes = [
      zone,
    ]
  }
}

resource "azurerm_mysql_flexible_database" "app" {
  count               = local.enable ? 1 : 0
  name                = var.database_name
  resource_group_name = azurerm_resource_group.preview[0].name
  server_name         = azurerm_mysql_flexible_server.main[0].name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}

# NOTE: Do not manage "Allow Azure services" (0.0.0.0) via Terraform here — azurerm often hits
# "Provider produced inconsistent result after apply" on Flexible Server firewall rules.
# Run the command in output `mysql_allow_azure_firewall_az_cli` once after apply.

resource "azurerm_mysql_flexible_server_firewall_rule" "developer" {
  for_each = local.enable ? {
    for idx, ip in var.developer_ip_allowlist : "dev-${idx}" => ip
  } : {}

  name                = each.key
  resource_group_name = azurerm_resource_group.preview[0].name
  server_name         = azurerm_mysql_flexible_server.main[0].name
  start_ip_address    = split("/", each.value)[0]
  end_ip_address      = split("/", each.value)[0]
}

# -----------------------------------------------------------------------------
# Shared Linux App Service plan (API + chatbot = one SKU charge)
# -----------------------------------------------------------------------------
resource "azurerm_service_plan" "preview" {
  count               = local.enable ? 1 : 0
  name                = "${var.project_name}-plan"
  resource_group_name = azurerm_resource_group.preview[0].name
  location            = azurerm_resource_group.preview[0].location
  os_type             = "Linux"
  sku_name            = var.app_service_sku
}

resource "azurerm_linux_web_app" "api" {
  count               = local.enable ? 1 : 0
  name                = "${var.project_name}-api"
  resource_group_name = azurerm_resource_group.preview[0].name
  location            = azurerm_service_plan.preview[0].location
  service_plan_id     = azurerm_service_plan.preview[0].id
  https_only          = true

  # Avoid racing MySQL create; reduces flaky ARM 404 while Flexible Server finishes provisioning.
  depends_on = [
    azurerm_mysql_flexible_database.app,
  ]

  timeouts {
    create = "60m"
    update = "60m"
  }

  site_config {
    always_on = false

    application_stack {
      java_server         = "JAVA"
      java_server_version = "17"
      java_version        = "17"
    }
  }

  app_settings = {
    "WEBSITES_PORT"          = "8080"
    "DB_URL"                 = local.jdbc_url
    "DB_USERNAME"            = var.mysql_administrator_login
    "DB_PASSWORD"            = random_password.mysql_admin[0].result
    "FRONTEND_URL"           = var.frontend_url
    "SPRING_PROFILES_ACTIVE" = "prod"
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_linux_web_app" "chatbot" {
  count               = local.enable ? 1 : 0
  name                = "${var.project_name}-chatbot"
  resource_group_name = azurerm_resource_group.preview[0].name
  location            = azurerm_service_plan.preview[0].location
  service_plan_id     = azurerm_service_plan.preview[0].id
  https_only          = true

  site_config {
    always_on = false

    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = merge(
    {
      "NODE_ENV" = "production"
    },
    var.genai_api_key != "" ? { "GENAI_API_KEY" = var.genai_api_key } : {}
  )

  identity {
    type = "SystemAssigned"
  }
}
