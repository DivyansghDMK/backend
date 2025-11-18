# AWS Deployment Guide

Complete guide for deploying the CPAP/BIPAP API on AWS.

## AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended) ⭐⭐⭐
**Best for:** Quick deployment, automatic scaling, easy management

### Option 2: AWS EC2 (Full Control)
**Best for:** Custom configurations, full server control

### Option 3: AWS ECS/Fargate (Containers)
**Best for:** Docker-based deployments, microservices

### Option 4: AWS Lambda + API Gateway (Serverless)
**Best for:** Pay-per-use, auto-scaling, low cost

---

## Option 1: AWS Elastic Beanstalk (Recommended)

Elastic Beanstalk is the easiest way to deploy Node.js applications on AWS.

### Prerequisites

1. AWS Account
2. AWS CLI installed
3. EB CLI installed

### Step 1: Install AWS EB CLI

```bash
# macOS
brew install aws-elasticbeanstalk

# Or using pip
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# AWS Access Key ID: your_access_key
# AWS Secret Access Key: your_secret_key
# Default region: us-east-1
# Default output format: json
```

### Step 3: Create Application Files

Create `.ebignore` file:

```bash
cat > .ebignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
.git/
.gitignore
*.md
examples/
scripts/
aws-iot/
EOF
```

Create `.platform/hooks/postdeploy/01_migrate.sh` (optional):

```bash
mkdir -p .platform/hooks/postdeploy
cat > .platform/hooks/postdeploy/01_migrate.sh << 'EOF'
#!/bin/bash
# This runs after deployment
echo "Post-deploy hook executed"
EOF
chmod +x .platform/hooks/postdeploy/01_migrate.sh
```

### Step 4: Initialize Elastic Beanstalk

```bash
cd /Users/deckmount/Documents/mehulapi

# Initialize EB
eb init

# Follow prompts:
# Select region: us-east-1 (or your region)
# Application name: mehulapi
# Platform: Node.js
# Platform version: Node.js 18 (or latest)
# Setup SSH: Yes (optional, for debugging)
```

This creates `.elasticbeanstalk/config.yml` file.

### Step 5: Create Environment

```bash
# Create production environment
eb create mehulapi-production \
  --instance-type t3.small \
  --envvars NODE_ENV=production

# Or interactive mode
eb create
```

**Wait for environment creation** (5-10 minutes)

### Step 6: Set Environment Variables

```bash
# Set environment variables
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/mehulapi" \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_access_key \
  AWS_SECRET_ACCESS_KEY=your_secret_key \
  AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com

# Or set one at a time
eb setenv MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/mehulapi"
eb setenv AWS_REGION=us-east-1
```

### Step 7: Deploy

```bash
# Deploy application
eb deploy

# Or deploy with specific environment
eb deploy mehulapi-production
```

### Step 8: Get Production URL

```bash
# Open application in browser
eb open

# Or get URL
eb status

# Output shows:
# CNAME: mehulapi-production.us-east-1.elasticbeanstalk.com
```

### Step 9: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/iot/webhook
   ```
4. Save

### Useful EB Commands

```bash
# View logs
eb logs

# SSH into instance
eb ssh

# Check status
eb status

# View environment info
eb health

# Scale application
eb scale 2  # Scale to 2 instances

# View environment variables
eb printenv

# Open application
eb open

# Terminate environment (be careful!)
eb terminate
```

### Custom Domain Setup

```bash
# Add custom domain
eb custom --optionname aws:elasticbeanstalk:environment --optionvalue your-domain.com
```

Or in AWS Console:
1. Elastic Beanstalk → Your environment → Configuration
2. Load balancer → Add listener (HTTPS)
3. Add certificate
4. Configure DNS CNAME to EB URL

---

## Option 2: AWS EC2 Deployment

For full control over the server.

### Step 1: Launch EC2 Instance

1. Go to EC2 Console → Launch Instance
2. Choose Amazon Linux 2023 or Ubuntu
3. Instance type: t3.small or t3.medium
4. Create key pair
5. Configure security group:
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow SSH (port 22) - your IP only
6. Launch instance

### Step 2: Connect to Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 3: Install Node.js

```bash
# Amazon Linux 2023
sudo dnf install -y nodejs npm

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install MongoDB (or use Atlas)

For MongoDB Atlas (recommended):
- Use MongoDB Atlas connection string
- No local MongoDB needed

For local MongoDB:
```bash
# Install MongoDB
# See MongoDB docs for your Linux distribution
```

### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/mehulapi.git
cd mehulapi

# Install dependencies
npm install --production

# Create .env file
nano .env

# Add environment variables
# NODE_ENV=production
# MONGODB_URI=...
# AWS_REGION=...
# etc.

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start server.js --name mehulapi

# Save PM2 configuration
pm2 save
pm2 startup

# View logs
pm2 logs mehulapi
```

### Step 6: Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo dnf install -y nginx  # Amazon Linux
# sudo apt-get install -y nginx  # Ubuntu

# Configure Nginx
sudo nano /etc/nginx/conf.d/mehulapi.conf
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

---

## Option 3: AWS ECS/Fargate (Docker)

For containerized deployments.

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Step 2: Build and Push Docker Image

```bash
# Build image
docker build -t mehulapi .

# Tag for ECR
docker tag mehulapi:latest your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest

# Create ECR repository
aws ecr create-repository --repository-name mehulapi

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Push image
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest
```

### Step 3: Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "mehulapi",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "mehulapi",
      "image": "your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:mongodb-uri"},
        {"name": "AWS_ACCESS_KEY_ID", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:aws-key-id"},
        {"name": "AWS_SECRET_ACCESS_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:aws-secret-key"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mehulapi",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 4: Create ECS Service

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster mehulapi-cluster \
  --service-name mehulapi-service \
  --task-definition mehulapi \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## Option 4: AWS Lambda + API Gateway (Serverless)

For serverless architecture.

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
```

### Step 2: Create serverless.yml

```yaml
service: mehulapi

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    MONGODB_URI: ${env:MONGODB_URI}
    AWS_REGION: us-east-1
    AWS_ACCESS_KEY_ID: ${env:AWS_ACCESS_KEY_ID}
    AWS_SECRET_ACCESS_KEY: ${env:AWS_SECRET_ACCESS_KEY}
    AWS_IOT_ENDPOINT: ${env:AWS_IOT_ENDPOINT}

functions:
  api:
    handler: serverless-handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY

plugins:
  - serverless-offline
```

### Step 3: Create Lambda Handler

Create `serverless-handler.js`:

```javascript
import serverless from 'serverless-http';
import app from './server.js';

export const handler = serverless(app);
```

### Step 4: Deploy

```bash
# Deploy
serverless deploy

# Get endpoint URL
serverless info
```

---

## Security Best Practices for AWS

### 1. Use AWS Secrets Manager

Store sensitive data in Secrets Manager instead of environment variables:

```bash
# Create secret
aws secretsmanager create-secret \
  --name mehulapi/mongodb-uri \
  --secret-string "mongodb+srv://user:pass@cluster.mongodb.net/mehulapi"
```

Access in code:
```javascript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(new GetSecretValueCommand({
  SecretId: "mehulapi/mongodb-uri"
}));
const mongodbUri = JSON.parse(response.SecretString);
```

### 2. Use IAM Roles (Instead of Access Keys)

For EC2/ECS/Lambda:
- Create IAM role with required permissions
- Attach role to instance/container/function
- Remove access keys from code

### 3. Security Groups

Restrict access:
- Only allow necessary ports
- Restrict SSH to specific IPs
- Use VPC for private resources

### 4. Enable CloudWatch Logs

Monitor application logs:
- Set up log groups
- Enable log retention
- Set up alarms

---

## Cost Estimation

### Elastic Beanstalk (t3.small)
- EC2 instance: ~$15/month
- Load Balancer: ~$18/month
- Data transfer: Pay as you go
- **Total: ~$33-50/month**

### EC2 (t3.small, no load balancer)
- EC2 instance: ~$15/month
- Data transfer: Pay as you go
- **Total: ~$15-25/month**

### ECS Fargate
- Fargate vCPU: ~$0.04/hour
- Memory: ~$0.004/GB-hour
- **Total: ~$20-40/month** (depending on usage)

### Lambda + API Gateway
- Lambda: First 1M requests free, then $0.20 per 1M
- API Gateway: First 1M requests free, then $3.50 per 1M
- **Total: ~$0-10/month** (for low to medium traffic)

---

## Recommended: Elastic Beanstalk

**Why:**
- ✅ Easiest AWS deployment for Node.js
- ✅ Automatic scaling
- ✅ Load balancer included
- ✅ Easy environment variable management
- ✅ Built-in monitoring
- ✅ Easy rollbacks

**Quick Start:**
```bash
eb init
eb create mehulapi-production
eb setenv NODE_ENV=production MONGODB_URI=...
eb deploy
eb open
```

---

## Troubleshooting

### EB Deployment Fails

```bash
# Check logs
eb logs

# Check events
eb events

# SSH into instance
eb ssh
```

### High Memory Usage

```bash
# Scale up instance type
eb scale --instance-types t3.medium

# Or add more instances
eb scale 2
```

### Environment Variables Not Working

```bash
# Check environment variables
eb printenv

# Set again
eb setenv VARIABLE=value
```

---

## Next Steps

1. Choose deployment option (Elastic Beanstalk recommended)
2. Set up AWS account and credentials
3. Create MongoDB Atlas cluster
4. Deploy application
5. Configure environment variables
6. Update AWS IoT Core Rule with production URL
7. Test end-to-end flow
8. Set up monitoring and alarms

---

**Ready to deploy?** Start with Elastic Beanstalk for the easiest AWS deployment! 🚀

