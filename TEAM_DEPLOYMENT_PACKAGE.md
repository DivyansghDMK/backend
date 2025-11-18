# Team Deployment Package

## What to Share with Your Team

### 1. Essential Files for Deployment

**Core Application Files:**
```
mehulapi/
├── config/
│   ├── database.js          ✅ Required
│   └── awsIoT.js            ✅ Required (for IoT Core)
├── controllers/
│   ├── deviceController.js  ✅ Required
│   └── iotController.js     ✅ Required (for IoT Core)
├── models/
│   ├── DeviceData.js        ✅ Required
│   └── DeviceConfig.js      ✅ Required
├── routes/
│   ├── deviceRoutes.js      ✅ Required
│   └── iotRoutes.js         ✅ Required (for IoT Core)
├── utils/
│   └── dataParser.js        ✅ Required
├── package.json             ✅ Required
├── server.js                ✅ Required
└── .gitignore               ✅ Required
```

**Documentation Files:**
```
├── README.md                    ✅ Share with team
├── DEPLOYMENT.md                ✅ Share with team
├── TESTING_GUIDE.md             ✅ Share with team
├── AWS_IOT_SETUP.md             ✅ Share with team
├── ESP32_SETUP.md               ✅ Share with team
└── COMPLETE_FLOW.md             ✅ Share with team
```

### 2. Environment Variables Template

Create `.env.example` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi

# AWS IoT Core Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

**Important:** Share the `.env.example` file, NOT the actual `.env` file with credentials!

### 3. Quick Start Guide for Team

```markdown
# Quick Start

1. Clone repository
2. Run: npm install
3. Create .env file from .env.example
4. Update .env with your credentials
5. Start MongoDB (or use MongoDB Atlas)
6. Run: npm run dev
7. Test: curl http://localhost:3000/health
```

### 4. Deployment Checklist

Share this checklist with your team:

```
✅ MongoDB Atlas production cluster created
✅ Environment variables configured
✅ AWS IoT Core credentials set up
✅ Deployment platform chosen (Railway/Heroku/AWS)
✅ CORS configured for production domains
✅ API deployed and accessible
✅ Health check endpoint working
✅ IoT Core Rule updated with production URL
✅ End-to-end testing completed
✅ Monitoring set up
```

### 5. API Endpoints Reference

Share this API reference:

```
GET  /                    - API information
GET  /health              - Health check
POST /api/devices/data    - Receive device data
GET  /api/devices/:id/config        - Get device config
POST /api/devices/:id/config        - Set device config
POST /api/devices/:id/config/delivered - Mark config delivered
GET  /api/devices/:id/data          - Get device data history
POST /api/iot/webhook               - IoT Core webhook
```

## Deployment Options Summary

### Recommended: Railway (Easiest)

**Why:** 
- Easiest to set up
- Free tier available
- Auto-deploys from GitHub
- Automatic HTTPS

**Steps:**
1. Push code to GitHub
2. Connect Railway to GitHub
3. Add environment variables
4. Deploy automatically

### Alternative: Heroku

**Why:**
- Popular platform
- Well-documented
- Easy scaling

**Steps:**
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy via Git

## Production Environment Variables

Share these variables (values should be set on deployment platform, not in code):

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ❌ | Usually set by platform |
| `MONGODB_URI` | ✅ | Production MongoDB connection string |
| `AWS_REGION` | ✅ | AWS region (e.g., us-east-1) |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS access key for IoT Core |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS secret key for IoT Core |
| `AWS_IOT_ENDPOINT` | ✅ | IoT Core endpoint URL |

## MongoDB Atlas Production Setup

### For Team:

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create free account

2. **Create Production Cluster:**
   - Choose M0 (Free) or M10 (Production) tier
   - Select region closest to your API

3. **Create Database User:**
   - Go to "Database Access"
   - Add user with read/write permissions

4. **Configure Network Access:**
   - Go to "Network Access"
   - Add IP addresses or allow from anywhere

5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password
   - Add database name: `/mehulapi?retryWrites=true&w=majority`

## AWS IoT Core Production Setup

### For Team:

1. **Create IAM User for API:**
   - Go to AWS IAM Console
   - Create new user: `mehulapi-iot-user`
   - Attach policy: `AWSIoTDataPlaneAccess`
   - Save Access Key ID and Secret Access Key

2. **Get IoT Endpoint:**
   - Go to AWS IoT Core Console → Settings
   - Copy "Device data endpoint"
   - Format: `xxxxx-ats.iot.us-east-1.amazonaws.com`

3. **Create IoT Core Rule:**
   - Go to IoT Core → Rules
   - Create rule: `ForwardDeviceDataToBackend`
   - SQL: `SELECT *, topic() as topic FROM 'esp32/+'`
   - Action: HTTPS endpoint → Production API URL

## Testing Production Deployment

### Test Script for Team:

```bash
#!/bin/bash

API_URL="https://your-production-api.com"

echo "Testing Production API..."
echo "=========================="

# 1. Health check
echo "1. Health Check:"
curl -s $API_URL/health | jq .

# 2. Send device data
echo "2. Sending Device Data:"
curl -s -X POST $API_URL/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "production_test_001"
  }' | jq .

# 3. Set configuration
echo "3. Setting Configuration:"
curl -s -X POST $API_URL/api/devices/production_test_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {"pressure": 16.0, "humidity": 7.0}
  }' | jq .

echo "✅ Production tests complete!"
```

## Deployment Timeline

### Phase 1: Preparation (Day 1)
- Set up MongoDB Atlas
- Set up AWS IoT Core credentials
- Choose deployment platform
- Prepare environment variables

### Phase 2: Deployment (Day 1-2)
- Deploy API to production
- Configure environment variables
- Test basic endpoints

### Phase 3: Integration (Day 2-3)
- Update IoT Core Rule with production URL
- Test IoT Core integration
- Test end-to-end flow

### Phase 4: Validation (Day 3)
- Complete end-to-end testing
- Set up monitoring
- Document production URLs

## Team Communication Template

```
Subject: CPAP/BIPAP API - Production Deployment

Hi Team,

The CPAP/BIPAP Device Data API is ready for production deployment.

📦 What's Included:
- Full API with device data management
- AWS IoT Core integration
- MongoDB database setup
- Complete documentation

🚀 Deployment Options:
1. Railway (Recommended - Easiest)
2. Heroku (Popular platform)
3. AWS Elastic Beanstalk (For AWS users)

📋 Next Steps:
1. Review DEPLOYMENT.md
2. Set up MongoDB Atlas production cluster
3. Configure AWS IoT Core credentials
4. Choose deployment platform
5. Deploy API
6. Update IoT Core Rule with production URL

📚 Documentation:
- DEPLOYMENT.md - Complete deployment guide
- README.md - API documentation
- TESTING_GUIDE.md - Testing instructions
- AWS_IOT_SETUP.md - IoT Core setup

🔗 Production URLs (after deployment):
- API: https://your-api-domain.com
- Health: https://your-api-domain.com/health
- MongoDB Atlas Dashboard: (share Atlas URL)
- AWS IoT Console: (share IoT Core URL)

❓ Questions?
Please refer to documentation or reach out.

Thanks!
```

## Important Security Notes

**Share with Team:**

1. **Never commit `.env` file to Git**
   - Use `.env.example` as template
   - Set environment variables on deployment platform

2. **Use Production Credentials**
   - Don't use development credentials in production
   - Rotate keys regularly
   - Use IAM roles when possible (AWS)

3. **Secure MongoDB Access**
   - Use strong passwords
   - Restrict network access
   - Enable MongoDB Atlas security features

4. **API Security**
   - Use HTTPS only
   - Enable CORS restrictions
   - Set up rate limiting
   - Monitor for unusual activity

## Support & Troubleshooting

**For Team:**

- Documentation: All guides in project root
- Testing: See `TESTING_GUIDE.md`
- Deployment Issues: See `DEPLOYMENT.md`
- AWS IoT Issues: See `AWS_IOT_SETUP.md`

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Status:** Ready for Production

