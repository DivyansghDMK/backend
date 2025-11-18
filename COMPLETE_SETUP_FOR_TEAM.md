# Complete Setup Guide - Device Data to Database

This guide shows you exactly how to get device data from AWS IoT Core into MongoDB database.

## Current Status

✅ **Device sends data** → AWS IoT Core receives it  
✅ **Your API works** → Can receive and save data  
✅ **MongoDB connected** → Can save data  
❌ **Missing link** → AWS IoT Core Rule not forwarding to API

## Quick Fix - Get Data to Database

### Step 1: Start ngrok (For Local Testing)

AWS IoT Core needs a public HTTPS URL to reach your local API.

**Terminal 2 (separate from npm run dev):**

```bash
cd /Users/deckmount/Documents/mehulapi

# Install ngrok if not installed
brew install ngrok

# Start ngrok
ngrok http 3000
```

**You'll see:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the ngrok URL!** (e.g., `https://abc123.ngrok.io`)

### Step 2: Create/Update AWS IoT Core Rule

1. **Go to:** AWS Console → IoT Core → Rules
2. **Click:** "Create rule" (or edit existing)
3. **Configure:**

   **Rule name:**
   ```
   ForwardESP32DataToBackend
   ```

   **SQL query:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```

   **Action:**
   - Click "Add action"
   - Select "Send a message to an HTTPS endpoint"
   - **URL:** `https://abc123.ngrok.io/api/iot/webhook` (your ngrok URL)
   - **HTTP Header:**
     - Key: `Content-Type`
     - Value: `application/json`
   - Click "Create role" if prompted
   - Click "Add action"

4. **Save the rule**

### Step 3: Test - Device Sends Data

Now when your device sends data to `esp32/data24`:

1. ✅ **AWS IoT Core receives it** (you can see it)
2. ✅ **IoT Core Rule forwards it** to your API (automatic!)
3. ✅ **Your API receives it** at `/api/iot/webhook`
4. ✅ **API saves to MongoDB** (automatic!)
5. ✅ **Data appears in MongoDB Atlas** (refresh to see it!)

### Step 4: Verify in MongoDB Atlas

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. **Refresh the page**
4. You should see your device data!

### Step 5: Check Your Server Logs

In terminal where `npm run dev` is running, when device sends data, you should see:

```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

## Complete Automatic Flow

```
ESP32 Device
    ↓ Publishes to esp32/data24
    {
      "device_status": 0,
      "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
    }
AWS IoT Core
    ↓ Rule automatically forwards
Your Local API (via ngrok)
    https://abc123.ngrok.io/api/iot/webhook
    ↓ Receives and processes
MongoDB Atlas
    ↓ Saves to devicedatas collection
✅ Data in Database!
```

## What to Share with Your Team

### Essential Files to Share

**Core Application:**
- `server.js` - Main server
- `package.json` - Dependencies
- All files in: `config/`, `controllers/`, `models/`, `routes/`, `utils/`

**Documentation:**
- `README.md` - API documentation
- `SHARE_WITH_TEAM.md` - Team sharing guide
- `DEPLOYMENT.md` - Deployment guide
- `AWS_IOT_SETUP.md` - IoT Core setup
- `SAME_TOPIC_SETUP.md` - Same topic configuration

**Configuration Template:**
- `.env.example` - Environment variables template (NOT actual `.env`!)

### Quick Setup for Team

**For team members to get started:**

1. **Clone/Download repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=their_access_key
   AWS_SECRET_ACCESS_KEY=their_secret_key
   AWS_IOT_ENDPOINT=their-iot-endpoint-ats.iot.us-east-1.amazonaws.com
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test:**
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints for Team

**Base URL:** `http://localhost:3000` (local) or your production URL

### Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/devices/data` | POST | Receive device data |
| `/api/devices/:id/config` | GET | Get device config |
| `/api/devices/:id/config` | POST | Set device config |
| `/api/devices/:id/data` | GET | Get device data history |
| `/api/iot/webhook` | POST | IoT Core webhook |

## Testing Data Flow

### Test 1: Direct API Test

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
    "topic": "esp32/data24"
  }'
```

**Expected:** Data saved to MongoDB Atlas

### Test 2: Check MongoDB Atlas

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Refresh page
4. Should see your data with:
   - `device_id: "24"`
   - `device_type: "CPAP"` (auto-detected from AUTOMODE)
   - `device_data: "*,R,181125,1124,AUTOMODE,..."`
   - `parsed_data: { sections: {...} }`

## Deploy for Team (Production)

Once working locally, deploy to production:

### Option 1: AWS Elastic Beanstalk

```bash
eb init
eb create mehulapi-production
eb setenv MONGODB_URI=... AWS_REGION=... (etc)
eb deploy
```

### Option 2: Railway (Easiest)

1. Push code to GitHub
2. Go to https://railway.app
3. Deploy from GitHub repo
4. Add environment variables
5. Get production URL

Then update AWS IoT Core Rule to use production URL instead of ngrok.

## What's Happening Now

1. ✅ **Device sends data** → AWS IoT Core (you see it in MQTT test client)
2. ❌ **IoT Core Rule** → Not forwarding to your API yet
3. ✅ **Your API** → Ready to receive (tested and working)
4. ✅ **MongoDB** → Ready to save (connected)

**What you need:**
- Set up AWS IoT Core Rule with ngrok URL (for local)
- Or deploy API to production and use production URL

## Quick Action Items

1. ✅ **Start ngrok:** `ngrok http 3000`
2. ✅ **Create AWS IoT Core Rule** with ngrok URL
3. ✅ **Test:** Device sends data → Check MongoDB Atlas
4. ✅ **Share with team:** Give them code + documentation

---

**See:** `SHARE_WITH_TEAM.md` for complete team sharing guide


