# Quick Fix - Device Data Not Reaching MongoDB

Your device sent data but it's not in MongoDB. Here's the quick fix:

## The Problem

✅ **Your API works** - webhook endpoint tested successfully  
✅ **MongoDB works** - can save data manually  
❌ **IoT Core Rule not forwarding** - Device → IoT Core → **???** → Your API

## Quick Fix Steps

### Step 1: Check if AWS IoT Core Rule is Set Up

**Go to AWS Console:**
1. AWS Console → IoT Core → Rules
2. **Do you see a rule for `esp32/+` topics?**
   - If **NO** → Create the rule (see below)
   - If **YES** → Check the rule action (see Step 2)

### Step 2: For Local Testing - Set Up ngrok

Your device sends data to AWS IoT Core, but IoT Core needs a **public HTTPS URL** to forward to your local API.

**Start ngrok:**

```bash
# Terminal 2 (separate from npm run dev)
cd /Users/deckmount/Documents/mehulapi
ngrok http 3000

# You'll see:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

### Step 3: Update AWS IoT Core Rule

1. **Go to:** AWS Console → IoT Core → Rules
2. **Find your rule** (or create new one)
3. **Edit the rule**
4. **Check the HTTPS Action:**
   - URL should be: `https://abc123.ngrok.io/api/iot/webhook`
   - Must include `/api/iot/webhook` at the end
   - Must be HTTPS (not HTTP)

5. **Save the rule**

### Step 4: Test Again

1. **Have your device send data again**
2. **Check your server logs** (terminal where `npm run dev` is running)
3. **Look for:**
   ```
   POST /api/iot/webhook 200
   IoT data received and processed successfully
   ```

**If you see this:** ✅ Data is flowing! Check MongoDB Atlas and refresh.

**If you DON'T see this:** Check rule URL again.

## Quick Setup: Create IoT Core Rule

If you don't have a rule set up:

1. **Go to:** AWS Console → IoT Core → Rules → Create Rule

2. **Configure:**
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

3. **Add Action:**
   - "Send a message to an HTTPS endpoint"
   - **URL:** `https://your-ngrok-url.ngrok.io/api/iot/webhook`
   - **Header:** `Content-Type: application/json`

4. **Save**

## Check Your Server Logs

**In the terminal where `npm run dev` is running:**

When your device sends data, you should see:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

**If you see this:** Everything is working! Refresh MongoDB Atlas.

**If you DON'T see this:** IoT Core Rule is not forwarding data.

## Troubleshooting Checklist

Go through this:

- [ ] ✅ Server is running (`npm run dev`)
- [ ] ✅ ngrok is running (if local testing): `ps aux | grep ngrok`
- [ ] ✅ AWS IoT Core Rule exists and is active
- [ ] ✅ Rule SQL matches: `esp32/+`
- [ ] ✅ Rule action URL is correct: `https://ngrok-url/api/iot/webhook`
- [ ] ✅ Rule action URL includes `/api/iot/webhook`
- [ ] ✅ Device is sending data to correct topic: `esp32/data24`
- [ ] ✅ MongoDB Atlas network access allows your IP

## Quick Test

**Test if rule is working:**

1. **Publish test data via AWS IoT Test Client:**
   - Go to: AWS Console → IoT Core → Test (MQTT test client)
   - **Publish to:** `esp32/data24`
   - **Message:**
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```

2. **Check your server logs:**
   - Should see `POST /api/iot/webhook 200`

3. **Check MongoDB Atlas:**
   - Refresh page
   - Should see data in `devicedatas` collection

## Most Common Issue

**AWS IoT Core Rule not forwarding to your API**

**Solution:**
1. Set up ngrok (for local): `ngrok http 3000`
2. Create/update IoT Core Rule with ngrok URL
3. Make sure URL includes `/api/iot/webhook`

## Summary

**The issue:** AWS IoT Core receives data from your device, but the Rule is not forwarding it to your API.

**The fix:** 
1. Set up ngrok (for local testing)
2. Configure AWS IoT Core Rule to forward to your API URL
3. Test and verify data flows

---

**Quick Action:** Start ngrok and update your AWS IoT Core Rule URL! That's likely what's missing.


