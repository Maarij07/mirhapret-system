# Deployment Guide

Instructions for deploying the e-commerce platform to production.

## Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to secure random 32+ character string
- [ ] Change `JWT_REFRESH_SECRET` to secure random 32+ character string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS origins (no wildcards)
- [ ] Set secure headers in Nginx
- [ ] Encrypt database backups
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up rate limiting on sensitive endpoints

### Performance
- [ ] Enable Redis caching
- [ ] Configure database connection pooling
- [ ] Set up CDN for static assets
- [ ] Enable gzip compression
- [ ] Add database indexes
- [ ] Configure image optimization

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (CloudWatch, ELK, etc.)
- [ ] Set up uptime monitoring
- [ ] Create alerts for critical errors
- [ ] Monitor database performance
- [ ] Track API response times

### Database
- [ ] Run all migrations
- [ ] Seed initial data
- [ ] Configure automatic backups
- [ ] Test backup restore process
- [ ] Set up read replicas for scaling
- [ ] Enable query logging

## Environment Variables for Production

Update `.env` with production values:

```env
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database (use managed service like AWS RDS, Azure Database, etc.)
DB_HOST=db.example.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=<strong-password>
DB_DATABASE=ecommerce_prod

# Redis (use managed service like AWS ElastiCache, Redis Cloud, etc.)
REDIS_HOST=redis.example.com
REDIS_PORT=6379

# RabbitMQ (use managed service)
RABBITMQ_URL=amqps://user:pass@rabbitmq.example.com:5672

# JWT
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

# CORS
CORS_ORIGINS=https://store.example.com,https://admin.example.com

# URLs
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_STORE_URL=https://store.example.com
NEXT_PUBLIC_ADMIN_URL=https://admin.example.com
```

## Docker Image Builds

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build ecommerce
docker-compose build admin
```

### Tag Images for Registry

```bash
# Tag images
docker tag mirhapret-backend:latest myregistry.azurecr.io/mirhapret-backend:1.0.0
docker tag mirhapret-ecommerce:latest myregistry.azurecr.io/mirhapret-ecommerce:1.0.0
docker tag mirhapret-admin:latest myregistry.azurecr.io/mirhapret-admin:1.0.0

# Push to registry
docker push myregistry.azurecr.io/mirhapret-backend:1.0.0
docker push myregistry.azurecr.io/mirhapret-ecommerce:1.0.0
docker push myregistry.azurecr.io/mirhapret-admin:1.0.0
```

## Cloud Deployment Options

### Option 1: AWS (Recommended for Scale)

#### Services
- **Compute**: ECS (Elastic Container Service) or EKS (Kubernetes)
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Message Queue**: Amazon MQ (RabbitMQ)
- **Storage**: S3 (via Cloudinary integration)
- **CDN**: CloudFront
- **Monitoring**: CloudWatch
- **Error Tracking**: Sentry

#### Deploy with Docker Compose on EC2

```bash
# Create EC2 instance (Ubuntu 22.04)
# SSH into instance

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/your-org/ecommerce-platform.git
cd ecommerce-platform

# Copy production env file
cp .env.prod .env

# Pull images and run
docker-compose up -d
```

#### Deploy with ECS

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    image: myregistry.azurecr.io/mirhapret-backend:1.0.0
    environment:
      - NODE_ENV=production
      - DB_HOST=db.example.com
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    # ... other configs
```

Deploy to ECS:

```bash
# Install AWS CLI
aws ecr describe-repositories

# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag myregistry.azurecr.io/mirhapret-backend:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/mirhapret-backend:1.0.0
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/mirhapret-backend:1.0.0
```

### Option 2: Azure

#### Services
- **Compute**: Azure Container Instances (ACI) or App Service
- **Database**: Azure Database for PostgreSQL
- **Cache**: Azure Cache for Redis
- **Service Bus**: Azure Service Bus (RabbitMQ alternative)
- **Storage**: Azure Blob Storage
- **CDN**: Azure CDN
- **Monitoring**: Application Insights

#### Deploy to Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create --name mirhapret-rg --location eastus

# Create container registry
az acr create --resource-group mirhapret-rg --name mirhapretacr --sku Basic

# Login to registry
az acr login --name mirhapretacr

# Tag and push images
docker tag mirhapret-backend:latest mirhapretacr.azurecr.io/mirhapret-backend:1.0.0
docker push mirhapretacr.azurecr.io/mirhapret-backend:1.0.0

# Deploy with Azure CLI
az container create \
  --resource-group mirhapret-rg \
  --name mirhapret-backend \
  --image mirhapretacr.azurecr.io/mirhapret-backend:1.0.0 \
  --environment-variables NODE_ENV=production
```

### Option 3: Google Cloud Platform (GCP)

#### Services
- **Compute**: Cloud Run or GKE
- **Database**: Cloud SQL (PostgreSQL)
- **Cache**: Memorystore (Redis)
- **Message Queue**: Cloud Pub/Sub
- **Storage**: Cloud Storage
- **CDN**: Cloud CDN
- **Monitoring**: Cloud Monitoring

#### Deploy to Cloud Run

```bash
# Install gcloud CLI
gcloud auth login

# Create project
gcloud projects create mirhapret-prod

# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/mirhapret-prod/mirhapret-backend

# Deploy to Cloud Run
gcloud run deploy mirhapret-backend \
  --image gcr.io/mirhapret-prod/mirhapret-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,DB_HOST=... \
  --memory 2Gi \
  --cpu 2
```

## Kubernetes Deployment

### Create Helm Chart

```bash
helm create mirhapret-platform
```

### Example values.yaml

```yaml
backend:
  replicaCount: 3
  image: myregistry.azurecr.io/mirhapret-backend:1.0.0
  env:
    NODE_ENV: production
    DB_HOST: postgres.example.com
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1024Mi

ecommerce:
  replicaCount: 2
  image: myregistry.azurecr.io/mirhapret-ecommerce:1.0.0

admin:
  replicaCount: 2
  image: myregistry.azurecr.io/mirhapret-admin:1.0.0

postgres:
  enabled: false  # Use managed service
  
redis:
  enabled: false  # Use managed service
```

### Deploy to Kubernetes

```bash
# Install Helm chart
helm install mirhapret ./mirhapret-platform \
  --namespace production \
  --create-namespace \
  -f values.prod.yaml

# Check deployment
kubectl get pods -n production

# View logs
kubectl logs -n production -l app=backend -f
```

## SSL/TLS Configuration

### With Let's Encrypt + Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.example.com

# Auto-renew
sudo systemctl enable certbot.timer
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Migrations in Production

```bash
# Before deploying new code:
npm run typeorm migration:run

# If rollback needed:
npm run typeorm migration:revert
```

## Zero-Downtime Deployments

### Blue-Green Deployment

```bash
# Deploy to "green" environment
docker-compose -f docker-compose.green.yml up -d

# Run health checks
curl http://green-backend:3000/api/health

# Switch traffic to green
# Update load balancer or DNS

# Keep "blue" as backup for rollback
```

### Rolling Updates (Kubernetes)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  # ... pod spec
```

## Monitoring & Alerts

### Set Up Monitoring

```bash
# Deploy Prometheus + Grafana for metrics
# Deploy ELK Stack for logs
# Configure Sentry for error tracking
```

### Example Alert Rules

- Backend: CPU > 80%
- Backend: Memory > 85%
- Database: Connection pool > 90%
- API: Error rate > 1%
- API: Response time > 2s
- Sync: Failed sync > 5%
- Storage: Disk space < 10%

## Backup Strategy

### Automated Database Backups

```bash
# AWS RDS: Enable automated backups (35-day retention)
# Azure Database: Enable backup retention (35 days)
# GCP Cloud SQL: Enable automated backups

# Manual backup
pg_dump -h db.example.com -U admin ecommerce_prod > backup-$(date +%Y%m%d).sql

# Test restore process monthly
```

### Backup Rotation

```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/backups"
DB_HOST="db.example.com"
DB_USER="admin"
DB_NAME="ecommerce_prod"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz"

pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +30 -delete
```

## Rollback Procedure

If deployment fails:

```bash
# Rollback to previous Docker image
docker-compose down
docker-compose up -d  # With previous version

# Rollback database migrations
npm run typeorm migration:revert

# Verify application is running
curl http://localhost:3000/api/v1/health
```

## Post-Deployment

- [ ] Verify all services are running
- [ ] Check logs for errors
- [ ] Run health checks
- [ ] Test critical user flows
- [ ] Monitor error tracking (Sentry)
- [ ] Verify database performance
- [ ] Confirm backups are working
- [ ] Update documentation
- [ ] Notify stakeholders

## Rollback Timeline

- **Immediate**: If critical errors detected
- **Within 5 mins**: If API response time > 5s
- **Within 15 mins**: If error rate > 5%
- **Within 1 hour**: If other critical issues

## Production Runbook

See `RUNBOOK.md` for operational procedures.
