# Railway Deployment Guide (Easiest)

Railway is the easiest way to deploy your API. Free tier available, automatic HTTPS, auto-deploy from GitHub.

## Prerequisites

- GitHub account
- Railway account (free): https://railway.app
- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas
- AWS IoT Core set up

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - CPAP/BIPAP API"

# Create GitHub repository, then:
git remote add origin https://github.com/yourusername/mehulapi.git
git push -u origin main
```

### Step 2: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

### Step 3: Deploy from GitHub

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `mehulapi` repository
4. Railway will auto-detect Node.js and start deploying

### Step 4: Configure Environment Variables

In Railway project dashboard:

1. Go to "Variables" tab
2. Add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

3. Click "Add" for each variable

### Step 5: Get Production URL

1. Go to "Settings" tab
2. Railway provides a domain like: `mehulapi-production.up.railway.app`
3. Or add custom domain in "Domains" section

### Step 6: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.up.railway.app/api/iot/webhook
   ```
4. Save rule

### Step 7: Test Production API

```bash
# Health check
curl https://mehulapi-production.up.railway.app/health

# Test device data
curl -X POST https://mehulapi-production.up.railway.app/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test"
  }'
```

## Railway Advantages

✅ **Automatic HTTPS** - SSL certificates included
✅ **Auto-deploy** - Deploys on every git push
✅ **Free tier** - $5 free credit monthly
✅ **Easy scaling** - Click to scale
✅ **Logs** - Built-in log viewer
✅ **Environment variables** - Easy to manage

## Railway Pricing

- **Free tier:** $5 credit monthly
- **Hobby:** $20/month for consistent usage
- **Pro:** $40/month with more resources

## Custom Domain Setup

1. In Railway dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `api.yourcompany.com`)
4. Add CNAME record in your DNS:
   ```
   api.yourcompany.com → your-project.up.railway.app
   ```
5. Railway automatically provisions SSL certificate

## Monitoring & Logs

Railway provides:
- **Real-time logs** - View in dashboard
- **Metrics** - CPU, memory usage
- **Deployments** - History of all deployments

## Troubleshooting

### Build Fails

Check:
1. `package.json` has correct `start` script
2. Dependencies are in `package.json`
3. Node.js version is specified (optional)

### Environment Variables Not Working

1. Make sure variables are set in Railway dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

### API Not Accessible

1. Check Railway deployment status
2. Verify domain is correct
3. Check logs for errors

## Automatic Deployments

Railway auto-deploys on:
- Push to `main` branch (production)
- Push to other branches (preview deployments)

To disable auto-deploy:
1. Settings → Source
2. Disable "Deploy on Push"

## Database Connection

Railway works great with:
- MongoDB Atlas (recommended)
- Railway's own PostgreSQL (if migrating)

For MongoDB Atlas, just use the connection string in environment variables.

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Update IoT Core Rule with production URL
3. ✅ Set up monitoring (Railway has built-in)
4. ✅ Test end-to-end flow with devices
5. ✅ Set up custom domain (optional)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Estimated Setup Time:** 10-15 minutes
**Difficulty:** ⭐ Easy
**Recommended for:** Quick deployments, teams new to DevOps

