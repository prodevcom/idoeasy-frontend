# Project Configuration
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "idoeasy"
}

variable "environment" {
  description = "Environment (prod or dev)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "port" {
  description = "Application port"
  type        = number
  default     = 3001
}

# Docker Configuration
variable "docker_image_uri" {
  description = "Docker image URI in ECR"
  type        = string
  default     = "800572458310.dkr.ecr.us-east-1.amazonaws.com/idoeasy-frontend:latest"
}

# Custom Domain Configuration
variable "backend_url" {
  description = "Custom domain for App Runner"
  type        = string
  default     = "https://api.idoeasy.net"
}
