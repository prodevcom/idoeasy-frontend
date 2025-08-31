# AWS Region
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "idoeasy"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Domain Configuration
variable "custom_domain" {
  description = "Custom domain for the frontend (e.g., idoeasy.net)"
  type        = string
  default     = "idoeasy.net"
}

# Backend Configuration
variable "backend_url" {
  description = "URL of the backend API"
  type        = string
  default     = "https://api.idoeasy.net"
}



# App Runner Configuration
variable "port" {
  description = "Application port"
  type        = number
  default     = 3000
}

variable "docker_image_uri" {
  description = "Docker image URI in ECR"
  type        = string
  default     = "800572458310.dkr.ecr.us-east-1.amazonaws.com/idoeasy-frontend:latest"
}

variable "app_runner_cpu" {
  description = "App Runner CPU units"
  type        = string
  default     = "1024"
}

variable "app_runner_memory" {
  description = "App Runner memory in MB"
  type        = string
  default     = "2048"
}

