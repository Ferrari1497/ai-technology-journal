variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "prod_bucket_name" {
  description = "S3 bucket name for production"
  type        = string
}

variable "staging_bucket_name" {
  description = "S3 bucket name for staging"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "basic_auth_username" {
  description = "Basic auth username for staging"
  type        = string
  default     = "admin"
}

variable "basic_auth_password" {
  description = "Basic auth password for staging"
  type        = string
  sensitive   = true
}