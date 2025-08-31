# AWS Provider Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

# Reference to existing Secrets Manager Secret (DO NOT CREATE OR MODIFY)
data "aws_secretsmanager_secret" "app_env" {
  name = "${var.project_name}-${var.environment}-env"
}

locals {
  app_env_arn = data.aws_secretsmanager_secret.app_env.arn
}

# IAM Role for App Runner Service (execution) - already exists
data "aws_iam_role" "app_runner_service_role" {
  name = "${var.project_name}-${var.environment}-app-runner-service-role"
}

# IAM Role for App Runner to access ECR - already exists
data "aws_iam_role" "app_runner_access_role" {
  name = "${var.project_name}-${var.environment}-app-runner-access-role"
}

# App Runner Service
resource "aws_apprunner_service" "frontend" {
  service_name = "${var.project_name}-${var.environment}-frontend"

  # Prevent recreation unless absolutely necessary
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      source_configuration.0.image_repository.0.image_identifier,
      health_check_configuration,
      network_configuration
    ]
  }

  source_configuration {
    image_repository {
      image_configuration {
        port = var.port
        runtime_environment_variables = {
          NODE_ENV    = var.environment == "prod" ? "production" : "development"
          PORT        = tostring(var.port)
          BACKEND_URL = var.backend_url
        }
        runtime_environment_secrets = {
          NEXTAUTH_SECRET = "${local.app_env_arn}:NEXTAUTH_SECRET::"
        }
      }
      image_identifier      = var.docker_image_uri
      image_repository_type = "ECR"
    }

    # Authentication configuration for ECR
    authentication_configuration {
      access_role_arn = data.aws_iam_role.app_runner_access_role.arn
    }
  }

  # Health Check Configuration - More lenient settings
  health_check_configuration {
    protocol            = "HTTP"
    path                = "/"
    interval            = 5
    timeout             = 2
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  # Network Configuration
  network_configuration {
    egress_configuration {
      egress_type = "DEFAULT"
    }
    ingress_configuration {
      is_publicly_accessible = true
    }
    ip_address_type = "IPV4"
  }

  instance_configuration {
    instance_role_arn = data.aws_iam_role.app_runner_service_role.arn
    cpu               = var.app_runner_cpu
    memory            = var.app_runner_memory
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Custom Domain for idoeasy.net (main domain)
resource "aws_apprunner_custom_domain_association" "main_domain" {
  domain_name = var.custom_domain
  service_arn = aws_apprunner_service.frontend.arn

  # Automatic SSL/TLS configuration
  enable_www_subdomain = false
}

# Custom Domain for www.idoeasy.net
resource "aws_apprunner_custom_domain_association" "www_domain" {
  domain_name = "www.${var.custom_domain}"
  service_arn = aws_apprunner_service.frontend.arn

  # Automatic SSL/TLS configuration
  enable_www_subdomain = false
}
