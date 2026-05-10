variable "enable_azure" {
  type        = string
  description = "Set to \"true\" only when you intend to create Azure resources (preview environments)."
  default     = "false"
}

variable "location" {
  type        = string
  description = "Azure region for preview resources."
  default     = "eastus2"
}

variable "project_name" {
  type    = string
  default = "examwizards-preview"
}
