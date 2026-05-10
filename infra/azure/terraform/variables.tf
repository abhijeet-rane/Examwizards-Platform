variable "enable_azure" {
  type        = string
  description = "Set to \"true\" to create preview resources. When \"false\", only validation passes with empty outputs."
  default     = "false"
}

variable "location" {
  type = string
  description = <<-EOT
    Azure region for resource group, App Service plan, and web apps. Must match your subscription policy allowlist.
    Example allowlist: southeastasia, uaenorth, centralindia, austriaeast, eastasia — use one of yours exactly.
  EOT
  default     = "centralindia"
}

variable "mysql_location" {
  type        = string
  description = <<-EOT
    Region for Azure Database for MySQL Flexible Server only. Leave empty ("") to use var.location.
    If apply fails with ProvisionNotSupportedForRegion, set to another allowed region (often southeastasia or eastasia).
  EOT
  default     = ""
}

variable "project_name" {
  type        = string
  description = "Short prefix for resource names. Must yield globally unique App Service hostnames (letters, numbers, hyphens)."
  default     = "examwizards-preview"
}

variable "mysql_administrator_login" {
  type        = string
  description = "MySQL Flexible Server administrator login (cannot be azure_superuser, admin, etc.)."
  default     = "ewadmin"
}

variable "mysql_sku_name" {
  type        = string
  description = "Burstable B1ms is the typical minimum tier for Flexible Server (pricing varies by region)."
  default     = "B_Standard_B1ms"
}

variable "mysql_storage_gb" {
  type        = number
  description = "Storage size in GB (minimum allowed by Azure for the SKU, often 20)."
  default     = 20
}

variable "mysql_server_version" {
  type        = string
  description = "MySQL major version for Flexible Server."
  default     = "8.0.21"
}

variable "database_name" {
  type    = string
  default = "examwizards"
}

variable "app_service_sku" {
  type        = string
  description = "Linux App Service Plan SKU. B1 shares one plan between API and chatbot web apps."
  default     = "B1"
}

variable "frontend_url" {
  type        = string
  description = "Vercel site URL for CORS and redirects, e.g. https://your-app.vercel.app"
  default     = "https://placeholder.vercel.app"
}

variable "developer_ip_allowlist" {
  type        = list(string)
  description = "Optional public IPs allowed to connect to MySQL on 3306 for local debugging (CIDR range per element). Empty = no extra rules."
  default     = []
}

variable "genai_api_key" {
  type        = string
  description = "Optional: Google Gemini API key for chatbot Web App (leave empty and set in portal for safety)."
  default     = ""
  sensitive   = true
}
