output "resource_group_name" {
  description = "Preview resource group name when enable_azure is true."
  value       = try(azurerm_resource_group.preview[0].name, null)
}
