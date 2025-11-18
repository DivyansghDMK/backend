# Automatic Data Flow - How It Works

Yes! Once set up correctly, your API will **automatically receive data from AWS IoT Core** without any manual steps.

## Complete Automatic Flow

```
ESP32 Device (Hardware)
    ↓ (publishes data to IoT Core)
AWS IoT Core
    ↓ (IoT Core Rule automatically forwards)
Your Backend API (/api/iot/webhook)
    ↓ (saves to MongoDB)
MongoDB Atlas
    ↓ (checks for pending config)
Your Backend API
    ↓ (publishes config back)
AWS IoT Core
    ↓ (delivers to device)
ESP32 Device (Hardware)
✅ Hardware receives config update!
```

## How Automatic It Is

### ✅ Completely Automatic:
1. **Device sends data** → Automatically goes to IoT Core
2. **IoT Core Rule** → Automatically forwards to your API
3. **Your API** → Automatically saves to MongoDB
4. **Your API** → Automatically checks for config updates
5. **Your API** → Automatically publishes config back to IoT Core
6. **IoT Core** → Automatically delivers to device

**You don't need to do anything manually!** It all happens automatically once configured.

## What You Need to Set Up

### For Automatic Flow to Work:

1. ✅ **AWS IoT Core Rule** (forwards data to your API)
2. ✅ **Your API running** (receives data)
3. ✅ **MongoDB connected** (saves data)
4. ✅ **IoT Core credentials in .env** (publishes config back)

## Setup Steps

### Step 1: Set Up IoT Core Rule (One-time Setup)

**In AWS IoT Core Console:**

1. Go to: AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name:** `ForwardESP32DataToBackend`
   - **SQL:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```
4. **Action:** "Send a message to an HTTPS endpoint"
   - **URL:** Your API webhook URL
     - **For local testing:** Use ngrok URL: `https://abc123.ngrok.io/api/iot/webhook`
     - **For production:** Your production API URL: `https://your-api.com/api/iot/webhook`
5. Save the rule

**Once this rule is set up, it works automatically forever!**

### Step 2: For Local Testing - Use ngrok

Since AWS IoT Core needs a public HTTPS URL, use ngrok to expose your local API:

```bash
# Terminal 2 (separate from npm run dev)
cd /Users/deckmount/Documents/mehulapi
./setup-ngrok.sh

# Or manually:
ngrok http 3000
```

**Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

**Update IoT Core Rule:**
- HTTPS endpoint: `https://abc123.ngrok.io/api/iot/webhook`

**Note:** ngrok free tier gives new URL on restart - update rule each time

### Step 3: Verify Everything is Set

**Check your .env file has:**
```env
AWS_IOT_ENDPOINT=a2jqpfwttlq1yk-ats.iot.us-east-1.amazonaws.com
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

✅ You already have these set!

## Testing the Automatic Flow

### Test 1: Using AWS IoT Test Client (Simulates Device)

1. **Go to:** AWS Console → IoT Core → Test (MQTT test client)
2. **Subscribe to:** `esp32/config24` (to see config updates)
3. **Publish to:** `esp32/data24` with this message:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```

**What happens automatically:**
1. ✅ Message published to IoT Core
2. ✅ IoT Core Rule catches it
3. ✅ Rule forwards to your API (automatic!)
4. ✅ Your API receives it at `/api/iot/webhook`
5. ✅ API saves to MongoDB (automatic!)
6. ✅ API checks for config (automatic!)
7. ✅ API publishes config to `esp32/config24` (automatic!)
8. ✅ Config appears in AWS IoT Test Client (automatic!)

### Test 2: Check Your API Logs

In terminal where `npm run dev` is running:

Look for:
```
POST /api/iot/webhook 200
Config published to IoT Core topic: esp32/config24 for device: 24
```

**This means automatic flow is working!**

### Test 3: Check MongoDB

1. Go to MongoDB Atlas → Browse Collections
2. Check `devicedatas` collection
3. You should see the data automatically saved!

## Real Device Flow (When Hardware is Connected)

When your ESP32 hardware is actually connected:

1. **ESP32 publishes** to `esp32/data24` → **Automatic!**
2. **IoT Core receives** → **Automatic!**
3. **Rule forwards** to your API → **Automatic!**
4. **API processes** and saves → **Automatic!**
5. **API publishes config** back → **Automatic!**
6. **ESP32 receives** config → **Automatic!**

**No manual intervention needed!**

## Summary: Yes, It's Completely Automatic!

✅ **Once IoT Core Rule is set up** → Automatic forwarding
✅ **Once API is running** → Automatic receiving
✅ **Once MongoDB is connected** → Automatic saving
✅ **Once config is set** → Automatic publishing back

**You just need to:**
1. Set up the IoT Core Rule (one-time)
2. Keep your API running
3. That's it! Everything else is automatic

## Current Status

✅ **Your API:** Running and ready
✅ **MongoDB:** Connected (once you finish Atlas setup)
✅ **AWS Credentials:** Set in .env
✅ **IoT Core Endpoint:** Configured

**What's left:**
- Set up AWS IoT Core Rule (one-time setup)
- For local testing: Use ngrok to expose your local API

## Next Steps

1. ✅ Finish MongoDB Atlas setup (you're doing this now)
2. ✅ Set up AWS IoT Core Rule (see `IOT_CORE_RULE_SETUP.md`)
3. ✅ Test automatic flow using AWS IoT Test Client
4. ✅ Connect real hardware - it will work automatically!

---

**Bottom line:** Yes! Once the IoT Core Rule is set up, everything happens automatically. Your API will automatically receive data from the cloud whenever devices publish to IoT Core! 🚀

