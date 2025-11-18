# Local Testing Guide - IoT Core Integration

This guide shows you how to test the complete flow locally:
- Receiving data from AWS IoT Core → Your local API
- Sending config updates from your local API → AWS IoT Core → Devices

## Prerequisites

1. ✅ Backend API running locally (`npm run dev`)
2. ✅ MongoDB running (or MongoDB Atlas connection)
3. ✅ AWS IoT Core credentials configured in `.env`
4. ✅ AWS IoT Core Rule set up (or use ngrok for local testing)
5. ✅ AWS IoT Test Client access (web console)

## Option 1: Testing with AWS IoT Test Client (Recommended)

This simulates the complete flow using AWS IoT Console.

### Step 1: Start Your Local API

```bash
cd /Users/deckmount/Documents/mehulapi

# Make sure MongoDB is running or connected
# Update .env with your credentials

# Start the server
npm run dev
```

You should see:
```
Server running on port 3000
MongoDB Connected: ...
```

### Step 2: Set Up ngrok (For Local Testing)

Since AWS IoT Core needs a public HTTPS URL, use ngrok to expose your local API:

```bash
# Install ngrok
brew install ngrok

# Or download from: https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000
```

You'll get a URL like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Save this URL!** You'll need it for AWS IoT Core Rule.

### Step 3: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule (or create new one)
3. Update HTTPS endpoint to your ngrok URL:
   ```
   https://abc123.ngrok.io/api/iot/webhook
   ```
4. Save the rule

**Important:** If you restart ngrok, you'll get a new URL - update the rule again!

### Step 4: Test Receiving Data from IoT Core

#### Using AWS IoT Test Client:

1. **Go to AWS IoT Console → Test (MQTT test client)**
2. **Subscribe to config topic** (to see if config is published):
   - Click "Subscribe to a topic"
   - Topic: `esp32/config24`
   - Quality of Service: QoS 1
   - Click "Subscribe"

3. **Publish test data** (simulating device sending data):
   - Click "Publish to a topic"
   - Topic: `esp32/data24`
   - Message payload:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```
   - Click "Publish"

4. **Check your local API logs:**
   ```bash
   # In your terminal where npm run dev is running
   # You should see:
   # POST /api/iot/webhook 200
   # Config published to IoT Core topic: esp32/config24 for device: 24
   ```

5. **Check AWS IoT Test Client:**
   - Switch to subscribed topic: `esp32/config24`
   - You should see a config message appear!

### Step 5: Test Setting Configuration via API

#### Set Configuration:

```bash
# Set device configuration (this will publish to IoT Core on next data send)
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
      "temperature": 2.0,
      "mode": "MANUALMODE"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Device configuration saved successfully",
  "data": {
    "device_id": "24",
    "device_type": "CPAP",
    "config_values": { ... },
    "pending_update": true
  }
}
```

#### Send Device Data Again:

Now publish to `esp32/data24` again in AWS IoT Test Client. Your local API will:
1. Receive the data
2. Save to MongoDB
3. Check for pending config (finds the one you just set)
4. Publish config to `esp32/config24`

#### Verify in AWS IoT Test Client:

- Check `esp32/config24` subscription
- You should see the config message with your values!

## Option 2: Direct Testing (Without IoT Core Rule)

Test endpoints directly without AWS IoT Core Rule forwarding.

### Test 1: Test IoT Webhook Endpoint Directly

```bash
# Simulate IoT Core sending data to your local API
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24",
    "timestamp": "2025-11-15T12:00:00Z",
    "messageId": "test-msg-001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "..."
  },
  "config_update": {
    "available": false
  }
}
```

### Test 2: Set Configuration and Test Complete Flow

```bash
# 1. Set configuration
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0
    }
  }'

# 2. Send device data again (this should trigger config publishing)
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Check your local API logs** - you should see:
```
Config published to IoT Core topic: esp32/config24 for device: 24
```

**Verify in AWS IoT Test Client:**
- Subscribe to `esp32/config24`
- You should see the config message!

## Option 3: Complete End-to-End Test Script

Create a test script that simulates the complete flow:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🧪 Testing Complete IoT Flow"
echo "============================"
echo ""

echo "1️⃣  Setting Device Configuration..."
curl -s -X POST $API_URL/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 18.0,
      "humidity": 8.0,
      "temperature": 3.0,
      "mode": "MANUALMODE"
    }
  }' | python3 -m json.tool
echo ""

echo "2️⃣  Simulating Device Sending Data (via IoT Core webhook)..."
curl -s -X POST $API_URL/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24",
    "timestamp": "2025-11-15T12:00:00Z",
    "messageId": "test-msg-001"
  }' | python3 -m json.tool
echo ""

echo "3️⃣  Verifying Data Saved in MongoDB..."
curl -s "$API_URL/api/devices/24/data?limit=1" | python3 -m json.tool
echo ""

echo "4️⃣  Checking Configuration..."
curl -s $API_URL/api/devices/24/config | python3 -m json.tool
echo ""

echo "✅ Test Complete!"
echo ""
echo "📊 Next Steps:"
echo "1. Check AWS IoT Test Client - subscribe to esp32/config24"
echo "2. You should see config message published"
echo "3. Check local API logs for publish confirmation"
```

Save as `test-iot-flow.sh` and run:
```bash
chmod +x test-iot-flow.sh
./test-iot-flow.sh
```

## Monitoring the Complete Flow

### Terminal 1: Watch API Logs

```bash
# In terminal where npm run dev is running
# Watch for:
# - POST /api/iot/webhook 200
# - Config published to IoT Core topic: ...
```

### Terminal 2: Watch MongoDB (Optional)

```bash
# If using local MongoDB with mongosh
mongosh mehulapi

# Watch for new documents
db.devicedatas.watch().forEach(change => printjson(change))

# Or check latest data
db.devicedatas.find().sort({ timestamp: -1 }).limit(1).pretty()
```

### Browser: AWS IoT Test Client

1. AWS Console → IoT Core → Test
2. Subscribe to: `esp32/config24`
3. Watch for config messages appearing

### Terminal 3: Test Scripts

Run your test scripts to simulate devices sending data.

## Verification Checklist

After running tests, verify:

- [ ] ✅ Local API receives data at `/api/iot/webhook`
- [ ] ✅ Data saved to MongoDB (`devicedatas` collection)
- [ ] ✅ Configuration set via API
- [ ] ✅ Configuration saved to MongoDB (`deviceconfigs` collection)
- [ ] ✅ Config published to IoT Core (check logs)
- [ ] ✅ Config message visible in AWS IoT Test Client
- [ ] ✅ Complete round-trip working

## Troubleshooting Local Testing

### Issue: IoT Core Rule Not Forwarding

**Solution:**
- Verify ngrok URL is correct in rule
- Check ngrok tunnel is active
- Restart ngrok if needed (update rule with new URL)

### Issue: Config Not Being Published

**Check:**
1. AWS credentials in `.env` are correct
2. `AWS_IOT_ENDPOINT` is set correctly
3. Check local API logs for errors
4. Verify config has `pending_update: true` in MongoDB

**Debug:**
```bash
# Test IoT connection
node scripts/verify-iot-connection.js
```

### Issue: Data Not Saving to MongoDB

**Check:**
1. MongoDB is running (or Atlas connection works)
2. Connection string in `.env` is correct
3. Check local API logs for MongoDB errors

### Issue: ngrok URL Changed

**Solution:**
- ngrok free tier gives new URL on restart
- Update AWS IoT Core Rule with new URL
- Or use ngrok reserved domain (paid)

## Advanced: Using Postman/Thunder Client

Import these requests to test:

### Request 1: Set Configuration
```
POST http://localhost:3000/api/devices/24/config
Content-Type: application/json

{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 16.0,
    "humidity": 7.0
  }
}
```

### Request 2: Simulate IoT Webhook
```
POST http://localhost:3000/api/iot/webhook
Content-Type: application/json

{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  "topic": "esp32/data24"
}
```

## Complete Test Flow Diagram

```
1. Set Config via API
   POST /api/devices/24/config
   ↓
2. Config saved to MongoDB (pending_update: true)
   ↓
3. Simulate Device Sending Data
   (Via AWS IoT Core Rule → ngrok → Local API)
   POST /api/iot/webhook
   ↓
4. API receives data, saves to MongoDB
   ↓
5. API checks for pending config (finds it!)
   ↓
6. API publishes config to IoT Core
   Topic: esp32/config24
   ↓
7. Verify in AWS IoT Test Client
   Subscribe to esp32/config24 → See message!
```

## Quick Test Commands

```bash
# Terminal 1: Start API
npm run dev

# Terminal 2: Start ngrok (in another terminal)
ngrok http 3000

# Terminal 3: Run tests
./test-iot-flow.sh

# Browser: AWS IoT Test Client
# - Subscribe to esp32/config24
# - Watch for config messages
```

---

**Ready to test?** Follow Option 1 (AWS IoT Test Client) for the most realistic testing experience! 🚀

