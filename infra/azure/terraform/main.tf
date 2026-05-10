locals {
  enable = lower(var.enable_azure) == "true"
}

# Minimal placeholder: resource group only when explicitly enabled.
# Extend with azurerm_container_app_environment, azurerm_container_app, etc.

resource "azurerm_resource_group" "preview" {
  count    = local.enable ? 1 : 0
  name     = "${var.project_name}-rg"
  location = var.location
}
