# Quick Deployment Guide

Choose your deployment method:

## 🚀 Option 1: Railway (Recommended - 10 minutes)

**Easiest deployment option!**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mehulapi.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Click "Start a New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-deploys!

3. **Add Environment Variables:**
   In Railway dashboard → Variables tab, add:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
   ```

4. **Get URL:**
   Railway gives you: `https://your-project.up.railway.app`

5. **Update IoT Core Rule:**
   Change HTTPS endpoint to: `https://your-project.up.railway.app/api/iot/webhook`

**Done!** ✅

See full guide: `DEPLOYMENT_RAILWAY.md`

## ☁️ Option 2: Heroku (15 minutes)

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   heroku login
   ```

2. **Create app:**
   ```bash
   heroku create mehulapi-production
   ```

3. **Set variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set AWS_REGION=us-east-1
   heroku config:set AWS_ACCESS_KEY_ID=your_key
   heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
   heroku config:set AWS_IOT_ENDPOINT=your_endpoint
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Get URL:**
   ```bash
   heroku open
   ```

## ☁️ Option 3: AWS Elastic Beanstalk (20 minutes)

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   eb init -p node.js --region us-east-1
   ```

3. **Create environment:**
   ```bash
   eb create mehulapi-production
   ```

4. **Set environment variables in AWS Console**

5. **Deploy:**
   ```bash
   eb deploy
   ```

## 📦 What You Need Before Deploying

1. ✅ **MongoDB Atlas Production Cluster**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Get connection string

2. ✅ **AWS IoT Core Credentials**
   - IAM user with IoT Data Plane access
   - Access Key ID and Secret Access Key
   - IoT Core endpoint URL

3. ✅ **GitHub Repository** (for Railway/Heroku)
   - Push code to GitHub
   - Make repository private if needed

## 🔐 Environment Variables Checklist

Make sure you have these values ready:

- [ ] MongoDB Atlas connection string
- [ ] AWS Region (e.g., us-east-1)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key  
- [ ] AWS IoT Core Endpoint

## ✅ Post-Deployment Checklist

- [ ] API is accessible via HTTPS
- [ ] Health endpoint works: `/health`
- [ ] Test device data endpoint
- [ ] Update IoT Core Rule with production URL
- [ ] Test end-to-end flow
- [ ] Set up monitoring

## 🆘 Quick Troubleshooting

**API not accessible:**
- Check deployment platform status
- Verify environment variables are set
- Check logs in platform dashboard

**MongoDB connection fails:**
- Verify connection string
- Check MongoDB Atlas network access
- Ensure credentials are correct

**IoT Core not working:**
- Verify AWS credentials
- Check IoT Core endpoint
- Review IAM permissions

## 📚 Full Documentation

- Complete deployment: `DEPLOYMENT.md`
- Railway specific: `DEPLOYMENT_RAILWAY.md`
- Team package: `TEAM_DEPLOYMENT_PACKAGE.md`

## 🎯 Recommendation

**For quickest deployment:** Use Railway ⭐
- Takes 10 minutes
- Easiest setup
- Free tier available
- Auto-deploy from GitHub

---

**Ready to deploy?** Start with Railway! 🚀

