output "resource_group_name" {
  description = "Resource group containing preview resources."
  value       = try(azurerm_resource_group.preview[0].name, null)
}

output "mysql_fqdn" {
  description = "MySQL Flexible Server hostname."
  value       = try(azurerm_mysql_flexible_server.main[0].fqdn, null)
}

output "mysql_database_name" {
  description = "Application database name."
  value       = try(azurerm_mysql_flexible_database.app[0].name, null)
}

output "mysql_admin_username" {
  description = "MySQL administrator login."
  value       = local.enable ? var.mysql_administrator_login : null
}

output "mysql_admin_password" {
  description = "MySQL administrator password (store securely; shown once in Terraform output)."
  value       = try(random_password.mysql_admin[0].result, null)
  sensitive   = true
}

output "mysql_allow_azure_firewall_az_cli" {
  description = "Run once after apply so App Service can reach MySQL (Terraform skips this rule due to azurerm/provider quirks)."
  value = local.enable ? join(" ", [
    "az mysql flexible-server firewall-rule create",
    "--resource-group", azurerm_resource_group.preview[0].name,
    "--name", azurerm_mysql_flexible_server.main[0].name,
    "--rule-name", "AllowAzureServices",
    "--start-ip-address", "0.0.0.0",
    "--end-ip-address", "0.0.0.0",
  ]) : null
}

output "api_url" {
  description = "HTTPS origin for Spring Boot (append /api paths in Vite as needed)."
  value       = local.enable ? "https://${azurerm_linux_web_app.api[0].default_hostname}" : null
}

output "chatbot_url" {
  description = "HTTPS origin for Node chatbot (use as VITE_CHATBOT_API_URL without trailing slash)."
  value       = local.enable ? "https://${azurerm_linux_web_app.chatbot[0].default_hostname}" : null
}

output "vite_env_hint" {
  description = "Suggested Vercel / frontend build variables."
  value = local.enable ? {
    VITE_API_BASE_URL    = "https://${azurerm_linux_web_app.api[0].default_hostname}/api"
    VITE_CHATBOT_API_URL = "https://${azurerm_linux_web_app.chatbot[0].default_hostname}"
  } : null
}
