# AWS Deployment Quick Start

Fastest way to deploy on AWS using Elastic Beanstalk.

## Prerequisites

1. AWS Account
2. AWS CLI installed: `brew install awscli` (or download from AWS)
3. EB CLI installed: `pip install awsebcli` (or `brew install aws-elasticbeanstalk`)

## Quick Deployment (15 minutes)

### Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter:
- AWS Access Key ID: Your AWS access key
- AWS Secret Access Key: Your AWS secret key
- Default region: `us-east-1`
- Default output format: `json`

### Step 2: Initialize Elastic Beanstalk

```bash
cd /Users/deckmount/Documents/mehulapi

# Initialize EB
eb init

# Follow prompts:
# 1. Select region: us-east-1 (or your preferred region)
# 2. Application name: mehulapi
# 3. Platform: Node.js
# 4. Platform version: Node.js 18 or latest
# 5. Setup SSH: Yes (recommended)
```

### Step 3: Create Production Environment

```bash
# Create environment (this takes 5-10 minutes)
eb create mehulapi-production

# Or with specific instance type
eb create mehulapi-production --instance-type t3.small
```

**Wait for environment creation...**

### Step 4: Set Environment Variables

```bash
# Set all environment variables at once
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority" \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_access_key \
  AWS_SECRET_ACCESS_KEY=your_secret_key \
  AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

**Important:** Replace the placeholder values with your actual values!

### Step 5: Deploy Application

```bash
# Deploy to production
eb deploy
```

This will:
- Package your application
- Upload to S3
- Deploy to EC2 instances
- Run health checks

### Step 6: Get Production URL

```bash
# Open in browser
eb open

# Or get URL manually
eb status
```

You'll get a URL like:
```
http://mehulapi-production.us-east-1.elasticbeanstalk.com
```

### Step 7: Update AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/iot/webhook
   ```
4. Save

### Step 8: Test Production API

```bash
# Test health endpoint
curl https://mehulapi-production.us-east-1.elasticbeanstalk.com/health

# Test device data endpoint
curl -X POST https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test"
  }'
```

## Useful Commands

```bash
# View logs
eb logs

# Check status
eb status

# View environment health
eb health

# SSH into instance (for debugging)
eb ssh

# View environment variables
eb printenv

# Scale application
eb scale 2  # Scale to 2 instances

# Restart application
eb restart

# View recent events
eb events
```

## Troubleshooting

### Deployment Fails

```bash
# Check logs for errors
eb logs

# Check recent events
eb events

# Try deploying again
eb deploy
```

### Environment Variables Not Working

```bash
# Verify variables are set
eb printenv

# Update a variable
eb setenv VARIABLE_NAME=new_value

# Redeploy after changing variables
eb deploy
```

### Application Not Responding

```bash
# Check health
eb health

# Check logs
eb logs

# Restart environment
eb restart
```

## Custom Domain Setup

### Option 1: Using Route 53

1. Register domain in Route 53 (or use existing)
2. Create hosted zone
3. Create CNAME record:
   - Name: `api.yourdomain.com`
   - Value: `mehulapi-production.us-east-1.elasticbeanstalk.com`
4. Update Elastic Beanstalk environment:
   ```bash
   eb config
   # Edit configuration, add custom domain
   ```

### Option 2: Using Your Domain Provider

1. Go to your domain DNS settings
2. Create CNAME record:
   - Name: `api` (or subdomain)
   - Value: `mehulapi-production.us-east-1.elasticbeanstalk.com`
3. Wait for DNS propagation (5-30 minutes)

## SSL Certificate Setup

Elastic Beanstalk supports SSL certificates:

1. Go to AWS Certificate Manager (ACM)
2. Request certificate for your domain
3. Verify domain ownership
4. In Elastic Beanstalk → Configuration → Load balancer
5. Add listener (HTTPS, port 443)
6. Select your certificate
7. Save and apply

## Cost

**Estimated monthly cost:**
- EC2 t3.small: ~$15/month
- Load Balancer: ~$18/month
- Data transfer: Pay as you go (~$5-10/month)
- **Total: ~$35-50/month**

**Free tier:** If you're eligible for AWS Free Tier, first 12 months includes:
- 750 hours of EC2 t2.micro
- Some load balancer hours

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL certificate
3. ✅ Set up CloudWatch monitoring
4. ✅ Configure auto-scaling
5. ✅ Set up backups
6. ✅ Enable log retention

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] MongoDB Atlas connection string
- [ ] AWS Region (e.g., us-east-1)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] AWS IoT Core Endpoint

## Security Best Practices

1. **Use IAM Roles** (instead of access keys when possible)
2. **Store secrets in AWS Secrets Manager** (for sensitive data)
3. **Restrict security groups** (only necessary ports)
4. **Enable HTTPS** (SSL certificate)
5. **Regular updates** (keep dependencies updated)

---

**Estimated Time:** 15-20 minutes  
**Difficulty:** ⭐⭐ Medium  
**Recommended for:** Teams using AWS ecosystem

For detailed instructions, see `DEPLOYMENT_AWS.md`

