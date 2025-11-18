# Quick Local Testing Guide

Fast guide to test receiving data from cloud and sending updates back.

## Quick Start (5 minutes)

### Step 1: Start Your Local API

```bash
cd /Users/deckmount/Documents/mehulapi
npm run dev
```

Keep this terminal open - you'll see logs here.

### Step 2: Set Up ngrok (New Terminal)

```bash
# Terminal 2
cd /Users/deckmount/Documents/mehulapi
./setup-ngrok.sh

# Or manually:
ngrok http 3000
```

**Copy the ngrok URL** - looks like: `https://abc123.ngrok.io`

### Step 3: Update AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://abc123.ngrok.io/api/iot/webhook
   ```
4. Save

### Step 4: Test Complete Flow

#### A. Set Configuration (Terminal 3)

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {"pressure": 16.0, "humidity": 7.0}
  }'
```

#### B. Test via AWS IoT Test Client

1. **Open AWS IoT Test Client** (Browser)
   - Go to: AWS Console → IoT Core → Test (MQTT test client)

2. **Subscribe to config topic:**
   - Topic: `esp32/config24`
   - Click "Subscribe"

3. **Publish device data:**
   - Topic: `esp32/data24`
   - Message:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```
   - Click "Publish"

4. **Check Results:**
   - ✅ Terminal 1 (API logs): Should show "Config published to IoT Core"
   - ✅ AWS IoT Test Client: Should see config message on `esp32/config24`

## Visual Flow

```
AWS IoT Test Client
  ↓ Publish to esp32/data24
AWS IoT Core Rule
  ↓ Forward via HTTPS
ngrok Tunnel (abc123.ngrok.io)
  ↓ Forward to localhost:3000
Your Local API (/api/iot/webhook)
  ↓ Save to MongoDB
  ↓ Check for config (finds it!)
  ↓ Publish to esp32/config24
AWS IoT Core
  ↓ Deliver message
AWS IoT Test Client
  ↓ Subscribe to esp32/config24
✅ See config message!
```

## Quick Test Script

```bash
# Run complete test
./test-iot-flow.sh
```

This script:
1. Sets device configuration
2. Simulates device sending data
3. Verifies data saved
4. Checks configuration

## What to Watch

### Terminal 1 (API Logs)
Look for:
```
POST /api/iot/webhook 200
Config published to IoT Core topic: esp32/config24 for device: 24
```

### AWS IoT Test Client
- Subscribe to: `esp32/config24`
- Watch for config message appearing

### MongoDB (Optional)
```bash
# Check data saved
mongosh mehulapi
db.devicedatas.find().sort({ timestamp: -1 }).limit(1).pretty()
db.deviceconfigs.find({ device_id: "24" }).pretty()
```

## Troubleshooting

### API Not Receiving Data
- ✅ Check ngrok is running
- ✅ Verify AWS IoT Core Rule URL matches ngrok URL
- ✅ Check API is running on port 3000

### Config Not Published
- ✅ Verify AWS credentials in `.env`
- ✅ Check `AWS_IOT_ENDPOINT` is set
- ✅ Look for errors in API logs
- ✅ Test IoT connection: `node scripts/verify-iot-connection.js`

### Can't See Config in IoT Test Client
- ✅ Verify subscribed to correct topic: `esp32/config24`
- ✅ Check message quality: Auto-format JSON
- ✅ Try publishing again

## Complete Verification

After testing, verify:

- [ ] ✅ Local API logs show data received
- [ ] ✅ Data appears in MongoDB
- [ ] ✅ Config is set and saved
- [ ] ✅ API logs show config published
- [ ] ✅ Config message appears in AWS IoT Test Client

**All checked?** Your complete flow is working! 🎉

---

**See:** `LOCAL_TESTING_IOT.md` for detailed guide

