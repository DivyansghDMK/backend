# Deploy Your API - Quick Guide

Now that your API is working locally, here's how to deploy it for production/sharing with your team.

---

## 🚀 Recommended Deployment Options

### Option 1: Railway (Easiest - Recommended) ⭐⭐⭐

**Best for:** Quick deployment, free tier available, easy setup

**Pros:**
- Free tier available
- Deploys from GitHub automatically
- Environment variables easy to manage
- HTTPS included
- No credit card required (for free tier)

**Deploy Steps:**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Sign up:** https://railway.app

3. **Deploy:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect Node.js automatically

4. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add all variables from your `.env` file:
     ```
     PORT=3000
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://...
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=...
     AWS_SECRET_ACCESS_KEY=...
     AWS_IOT_ENDPOINT=...
     ```

5. **Get Production URL:**
   - Railway gives you a URL like: `https://mehulapi-production.up.railway.app`
   - This is your production API URL!

6. **Update AWS IoT Core Rule:**
   - Go to: AWS IoT Core → Rules → `ForwardESP32DataToBackend`
   - Click "Edit"
   - Update HTTPS endpoint URL to: `https://mehulapi-production.up.railway.app/api/iot/webhook`
   - Save

**See:** `DEPLOYMENT_RAILWAY.md` for detailed guide

---

### Option 2: AWS Elastic Beanstalk ⭐⭐

**Best for:** If you're already using AWS, want AWS integration

**Deploy Steps:**

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   eb init
   ```

3. **Create environment:**
   ```bash
   eb create mehulapi-production
   ```

4. **Set environment variables:**
   ```bash
   eb setenv NODE_ENV=production MONGODB_URI=... AWS_REGION=...
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

6. **Get URL:**
   ```bash
   eb open
   ```

**See:** `AWS_DEPLOYMENT_QUICK_START.md` for detailed guide

---

### Option 3: Heroku ⭐⭐

**Best for:** Simple deployments, popular platform

**Deploy Steps:**

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   heroku create mehulapi-production
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production MONGODB_URI=... AWS_REGION=...
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

**See:** `DEPLOYMENT.md` for detailed guide

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Code is working locally ✅ (You've tested this!)
- [ ] MongoDB Atlas is set up ✅ (You have this!)
- [ ] AWS IoT Core credentials are ready ✅ (You have this!)
- [ ] Code is in GitHub/GitLab (for automatic deployments)
- [ ] `.env` file has all required variables (but don't commit it!)
- [ ] `.gitignore` excludes `.env` file

---

## 🔄 After Deployment - Update AWS IoT Core Rule

**Important:** Once you have a production URL, update your AWS IoT Core Rule!

1. **Go to:** AWS IoT Core → Rules → `ForwardESP32DataToBackend`
2. **Click:** "Edit"
3. **Update HTTPS endpoint URL:**
   - Old: `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook` (ngrok)
   - New: `https://your-production-url.com/api/iot/webhook` (production)
4. **Save** the rule

**Now you can stop ngrok** - production URL will handle everything!

---

## 🧪 Test Production Deployment

After deployment:

1. **Test health endpoint:**
   ```bash
   curl https://your-production-url.com/health
   ```

2. **Test API:**
   ```bash
   curl https://your-production-url.com/
   ```

3. **Check if device data reaches production:**
   - Device sends data → AWS IoT Core → Production API → MongoDB
   - Check MongoDB Atlas for new data

---

## 📝 Environment Variables for Production

Make sure these are set in your deployment platform:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=your-endpoint-ats.iot.us-east-1.amazonaws.com
```

---

## 🎯 Quick Start: Railway (Recommended)

**Fastest way to deploy:**

1. Push code to GitHub
2. Sign up at railway.app
3. Deploy from GitHub
4. Add environment variables
5. Get production URL
6. Update AWS IoT Core Rule

**Total time: ~10 minutes**

---

## 🔗 Share API with Team

After deployment, share:

1. **Production URL:** `https://your-api-url.com`
2. **API Documentation:** `README.md`
3. **Environment Setup:** `.env.example` (template, no secrets)
4. **Deployment Guide:** `DEPLOY_NOW.md` (this file)

**API Endpoints:**
- Base: `https://your-api-url.com`
- Health: `https://your-api-url.com/health`
- Device Data: `https://your-api-url.com/api/devices/data`
- IoT Webhook: `https://your-api-url.com/api/iot/webhook` (used by AWS IoT Core)

---

## 🆘 Troubleshooting

### Deployment Fails:
- Check environment variables are set correctly
- Verify MongoDB URI is accessible from deployment platform
- Check deployment logs for errors

### API Not Receiving Data:
- Verify AWS IoT Core Rule has correct production URL
- Check production URL is accessible (test with curl)
- Verify environment variables in deployment platform

### MongoDB Connection Fails:
- Check MongoDB Atlas network access allows deployment platform IP
- Verify connection string is correct
- Check MongoDB credentials

---

**Recommendation: Start with Railway - it's the easiest!** 🚀

See detailed guides:
- `DEPLOYMENT_RAILWAY.md` - Railway deployment
- `AWS_DEPLOYMENT_QUICK_START.md` - AWS deployment
- `DEPLOYMENT.md` - Heroku deployment

