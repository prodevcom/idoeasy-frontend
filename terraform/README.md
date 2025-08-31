# Frontend Infrastructure - AWS App Runner

This Terraform configuration deploys the iDoEasy frontend using AWS App Runner, providing a scalable and managed container service.

## Architecture

- **AWS App Runner**: Hosts the Next.js containerized application
- **ECR Integration**: Uses Docker images from ECR repository
- **Custom Domains**: Configures both `idoeasy.net` and `www.idoeasy.net`
- **Route 53**: DNS management with automatic health checks
- **Auto Scaling**: Automatic scaling based on traffic

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Terraform** installed (version >= 1.0)
3. **Docker image** already built and pushed to ECR
4. **IAM Roles** already created:
   - `idoeasy-dev-app-runner-service-role`
   - `idoeasy-dev-app-runner-access-role`

## Configuration

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars` with your values:**
   - `custom_domain`: Your domain (e.g., `idoeasy.net`)
   - `docker_image_uri`: Your ECR image URI
   - `backend_url`: Your backend API URL
   - `port`: Application port (default: 3000)
   - `app_runner_cpu`: CPU units (default: 1024)
   - `app_runner_memory`: Memory in MB (default: 2048)

**Note**: `NEXTAUTH_SECRET` and `BACKEND_URL` are automatically loaded from AWS Secrets Manager.

## Deployment

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Plan the deployment:**
   ```bash
   terraform plan
   ```

3. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Features

- **Containerized Deployment**: Uses Docker images from ECR
- **Auto Scaling**: Automatic scaling based on traffic patterns
- **Dual Domain Support**: Both `idoeasy.net` and `www.idoeasy.net` work
- **HTTPS**: Automatic SSL/TLS configuration for both domains
- **Route 53 Integration**: Automatic DNS management and health checks
- **Environment Variables**: NextAuth secret and backend URL are injected

## Environment Variables

The following environment variables are automatically configured:

- `NODE_ENV`: Set based on environment (dev/prod)
- `PORT`: Application port (3000)
- `NEXTAUTH_SECRET`: Automatically loaded from AWS Secrets Manager
- `BACKEND_URL`: Automatically loaded from AWS Secrets Manager

## Monitoring

- **App Runner Console**: Monitor service performance and scaling
- **CloudWatch**: Application logs and metrics
- **ECR**: Container image management

## Cleanup

To destroy the infrastructure:
```bash
terraform destroy
```

**⚠️ Warning**: This will remove all resources including the App Runner service and domain associations.
