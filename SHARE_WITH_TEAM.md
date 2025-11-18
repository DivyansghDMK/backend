# CPAP/BIPAP API - Team Package

**Project:** CPAP/BIPAP Device Data Management API with AWS IoT Core Integration  
**Status:** Ready for Production Deployment  
**Version:** 1.0.0

## 📦 What to Share with Your Team

### Essential Files (Share All)

**Core Application:**
- `server.js` - Main server file
- `package.json` - Dependencies
- All files in: `config/`, `controllers/`, `models/`, `routes/`, `utils/`

**Documentation (Share All):**
- `README.md` - Full API documentation
- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_QUICK_START.md` - Quick deployment steps
- `DEPLOYMENT_RAILWAY.md` - Railway-specific guide
- `TESTING_GUIDE.md` - Testing instructions
- `AWS_IOT_SETUP.md` - AWS IoT Core setup
- `ESP32_SETUP.md` - ESP32 device setup
- `COMPLETE_FLOW.md` - End-to-end flow explanation

**Configuration Template:**
- `.env.example` - Environment variables template (NOT the actual `.env` file!)

### Do NOT Share

- ❌ `.env` file (contains secrets)
- ❌ `node_modules/` folder
- ❌ `.DS_Store` files
- ❌ Any files with actual credentials

## 🚀 Quick Deployment Options

### Option A: AWS Elastic Beanstalk (AWS Users) ⭐

**Best for:** Teams already using AWS ecosystem

**Quick Steps:**
1. Install EB CLI: `pip install awsebcli`
2. Configure AWS: `aws configure`
3. Initialize: `eb init`
4. Create environment: `eb create mehulapi-production`
5. Set variables: `eb setenv NODE_ENV=production MONGODB_URI=...`
6. Deploy: `eb deploy`
7. Get URL: `eb open`

**See:** `AWS_DEPLOYMENT_QUICK_START.md` for detailed guide

### Option B: Railway (Easiest) ⭐⭐⭐

**Best for:** Quick deployments, teams new to DevOps

**Quick Steps:**
1. Push to GitHub
2. Sign up: https://railway.app
3. Deploy from GitHub repo
4. Add environment variables
5. Get production URL automatically

**See:** `DEPLOYMENT_RAILWAY.md` for detailed guide

### Option C: Heroku (Popular)

**Best for:** Simple deployments, popular platform

**Quick Steps:**
1. Install Heroku CLI
2. Create app: `heroku create mehulapi-production`
3. Set variables: `heroku config:set NODE_ENV=production ...`
4. Deploy: `git push heroku main`

**See:** `DEPLOYMENT.md` for Heroku guide

## 🔐 Required Production Setup

### 1. MongoDB Atlas (Free)

**Steps:**
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user
4. Configure network access (Allow from Anywhere)
5. Get connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority
```

### 2. AWS IoT Core Credentials

**Steps:**
1. AWS Console → IAM → Create User
2. User name: `mehulapi-iot-user`
3. Attach policy: `AWSIoTDataPlaneAccess`
4. Create access key → Save Access Key ID and Secret
5. Get IoT Core endpoint: IoT Core → Settings → Device data endpoint

### 3. AWS IoT Core Rule

**Already set up?** Just update the HTTPS endpoint URL to production URL.

**Not set up?** See `AWS_IOT_SETUP.md` for detailed instructions.

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] MongoDB Atlas production cluster created
- [ ] AWS IoT Core credentials set up
- [ ] Code pushed to GitHub
- [ ] Environment variables documented (NOT actual values)
- [ ] Team has access to deployment platform
- [ ] Production URLs documented

## 🧪 Testing Production

After deployment:

```bash
# Test health endpoint
curl https://your-api-domain.com/health

# Test device data endpoint
curl -X POST https://your-api-domain.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_device"
  }'
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/devices/data` | POST | Receive device data |
| `/api/devices/:id/config` | GET | Get device configuration |
| `/api/devices/:id/config` | POST | Set device configuration |
| `/api/devices/:id/data` | GET | Get device data history |
| `/api/iot/webhook` | POST | AWS IoT Core webhook |

## 🗄️ Data Storage

**MongoDB Atlas:**
- **Database:** `mehulapi`
- **Collections:**
  - `devicedatas` - All device data
  - `deviceconfigs` - All device configurations

**View Data:**
- MongoDB Atlas Dashboard → Browse Collections
- Or use API endpoints

## 🔄 Complete Data Flow

```
ESP32 Hardware → AWS IoT Core → Production API → MongoDB Atlas
                                                      ↓
ESP32 Hardware ← AWS IoT Core ← Production API ← Config Updates
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main API documentation |
| `DEPLOYMENT.md` | Complete deployment guide |
| `DEPLOYMENT_QUICK_START.md` | Quick deployment steps |
| `DEPLOYMENT_RAILWAY.md` | Railway-specific guide |
| `TESTING_GUIDE.md` | How to test the API |
| `AWS_IOT_SETUP.md` | AWS IoT Core setup |
| `ESP32_SETUP.md` | ESP32 device configuration |
| `COMPLETE_FLOW.md` | End-to-end flow explanation |
| `TEAM_GUIDE.md` | Team onboarding guide |

## 🆘 Quick Troubleshooting

**API not accessible:**
- Check deployment platform status
- Verify environment variables
- Check logs in platform dashboard

**MongoDB connection fails:**
- Verify connection string
- Check Atlas network access
- Ensure credentials are correct

**IoT Core not working:**
- Verify AWS credentials
- Check IoT Core endpoint
- Review IAM permissions

## 📞 Support & Resources

- **Railway Support:** https://docs.railway.app
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **AWS IoT Core Docs:** https://docs.aws.amazon.com/iot

## 🎯 Next Steps

1. **Review Documentation**
   - Read `DEPLOYMENT_QUICK_START.md`
   - Review `TESTING_GUIDE.md`

2. **Set Up Production**
   - Create MongoDB Atlas cluster
   - Set up AWS IoT Core credentials
   - Deploy on Railway

3. **Test Production**
   - Test all endpoints
   - Verify IoT Core integration
   - Test end-to-end flow

4. **Monitor & Maintain**
   - Set up monitoring
   - Review logs regularly
   - Monitor API usage

---

**Ready to Deploy?** Start with `DEPLOYMENT_QUICK_START.md`! 🚀

**Questions?** Check documentation files or reach out to the team.

