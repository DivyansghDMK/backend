# Production Deployment Guide

This guide covers deploying the CPAP/BIPAP API to production with best practices.

## Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for AWS Users) ⭐

**Best for:** Teams already using AWS, need scalability

#### Setup Steps

1. **Install EB CLI:**
```bash
pip install awsebcli
eb init
```

2. **Configure:**
```bash
# Create .ebignore (similar to .gitignore)
echo "node_modules/
.env
*.log" > .ebignore

# Initialize EB
eb init -p node.js --region us-east-1 mehulapi-prod

# Create environment
eb create mehulapi-production
```

3. **Set Environment Variables in AWS Console:**
   - Go to Elastic Beanstalk → Configuration → Environment properties
   - Add:
     ```
     NODE_ENV=production
     PORT=8080
     MONGODB_URI=your_production_mongodb_uri
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=your_key
     AWS_SECRET_ACCESS_KEY=your_secret
     AWS_IOT_ENDPOINT=your_iot_endpoint
     ```

4. **Deploy:**
```bash
eb deploy
```

### Option 2: Railway (Easiest - Recommended) ⭐⭐⭐

**Best for:** Quick deployment, easy setup

#### Setup Steps

1. **Sign up:** https://railway.app
2. **Connect GitHub repository:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_uri
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_IOT_ENDPOINT=your_iot_endpoint
   ```
4. **Deploy:** Railway auto-deploys on git push
5. **Get URL:** Railway provides HTTPS URL automatically

### Option 3: Heroku

**Best for:** Simple deployments, popular platform

#### Setup Steps

1. **Install Heroku CLI:**
```bash
brew install heroku/brew/heroku
heroku login
```

2. **Create App:**
```bash
heroku create mehulapi-production
```

3. **Set Config Vars:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_IOT_ENDPOINT=your_iot_endpoint
```

4. **Deploy:**
```bash
git push heroku main
```

### Option 4: DigitalOcean App Platform

**Best for:** Simple, affordable hosting

1. Sign up at https://www.digitalocean.com
2. Create new App
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Option 5: AWS EC2 / Docker

**Best for:** Full control, custom infrastructure

See `DEPLOYMENT_DOCKER.md` for Docker setup.

## Production Configuration

### 1. Update package.json

Add production scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "production": "NODE_ENV=production node server.js"
  }
}
```

### 2. Create Production Environment File

**Never commit `.env` to git!** Use platform environment variables instead.

Create `.env.production` as template:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

### 3. Update Server Configuration

Update `server.js` for production:

```javascript
const PORT = process.env.PORT || 3000;

// Only log errors in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Less verbose logging
} else {
  app.use(morgan('dev'));
}
```

### 4. Enable CORS for Production

Update CORS settings:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
```

### 5. Add Security Middleware

Install security packages:

```bash
npm install helmet rate-limiter express-rate-limit
```

Add to `server.js`:

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## Production Checklist

### Before Deployment

- [ ] MongoDB Atlas production cluster set up
- [ ] Environment variables configured on platform
- [ ] AWS IoT Core credentials set up
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers (helmet) enabled
- [ ] Error handling configured
- [ ] Logging set up
- [ ] Health check endpoint working
- [ ] API documentation updated

### Security

- [ ] Use HTTPS only
- [ ] Environment variables secure (not in code)
- [ ] API keys stored securely
- [ ] CORS restricted to known domains
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] SQL injection protection (MongoDB is safe, but validate inputs)
- [ ] Regular dependency updates

### Monitoring

- [ ] Health check monitoring set up
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (CloudWatch, Datadog)

## Post-Deployment

### 1. Test Production API

```bash
# Test health endpoint
curl https://your-api-domain.com/health

# Test device data endpoint
curl -X POST https://your-api-domain.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{"device_status": 1, "device_data": "...", "device_type": "CPAP", "device_id": "test"}'
```

### 2. Update IoT Core Rule

Update AWS IoT Core Rule HTTPS endpoint to production URL:

```
https://your-api-domain.com/api/iot/webhook
```

### 3. Set Up Monitoring

- Configure uptime monitoring
- Set up error alerts
- Monitor API response times
- Track API usage

### 4. Domain Setup (Optional)

If using custom domain:

1. Add CNAME record pointing to deployment platform
2. Configure SSL certificate (usually auto-generated)
3. Update environment variables if needed

## Scaling Considerations

### Horizontal Scaling

- Use load balancer for multiple instances
- MongoDB Atlas scales automatically
- Stateless API design (no session storage in server)

### Database

- Use MongoDB Atlas for automatic backups
- Enable read replicas for high read volume
- Set up connection pooling

### Caching (Future)

Consider Redis for:
- Frequently accessed configurations
- Rate limiting counters
- Session management

## Backup & Recovery

### MongoDB Backups

- MongoDB Atlas: Automatic backups enabled by default
- Manual backup:
```bash
mongodump --uri="mongodb+srv://..." --out=/backup
```

### Application Code

- Version control (Git)
- Tag production releases
- Keep deployment scripts

## Troubleshooting Production

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB Atlas network access
   - Verify connection string
   - Check Atlas cluster status

2. **AWS IoT Errors**
   - Verify credentials
   - Check IAM permissions
   - Verify IoT Core endpoint

3. **High Memory Usage**
   - Enable node memory limits
   - Review inefficient queries
   - Add connection pooling limits

4. **Slow Response Times**
   - Add database indexes
   - Optimize queries
   - Enable caching
   - Scale horizontally

## Recommended Platforms Comparison

| Platform | Ease | Cost | Scaling | Best For |
|----------|------|------|---------|----------|
| Railway | ⭐⭐⭐ | Free-$20/mo | Auto | Quick deployments |
| Heroku | ⭐⭐ | $7-$25/mo | Manual | Simple apps |
| AWS EB | ⭐⭐ | Pay-as-go | Auto | AWS ecosystem |
| DigitalOcean | ⭐⭐ | $5-$12/mo | Manual | Affordable VPS |
| Render | ⭐⭐⭐ | Free-$25/mo | Auto | Easy deployments |

## Next Steps

1. Choose deployment platform
2. Set up MongoDB Atlas production cluster
3. Configure environment variables
4. Deploy API
5. Update IoT Core Rule with production URL
6. Test end-to-end flow
7. Set up monitoring

For detailed platform-specific instructions, see:
- `DEPLOYMENT_RAILWAY.md`
- `DEPLOYMENT_HEROKU.md`
- `DEPLOYMENT_AWS.md`

