# Debug Guide - Device Data Not Appearing in MongoDB

If your device sent data but it's not showing in MongoDB, check these:

## Quick Debugging Steps

### Step 1: Check if API is Receiving Data

**Check your terminal where `npm run dev` is running:**

Look for these logs:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

**If you DON'T see this:**
- ❌ Data is not reaching your API
- Check AWS IoT Core Rule setup (see below)

**If you DO see this:**
- ✅ API is receiving data
- Check MongoDB connection (see below)

### Step 2: Check AWS IoT Core Rule

**Your device sends data to AWS IoT Core, but your API needs to receive it.**

1. **Go to:** AWS Console → IoT Core → Rules
2. **Check:** Is there a rule for `esp32/+` topics?
3. **Verify:** Does the rule forward to your API URL?

**For Local Testing:**
- Rule should forward to: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- Make sure ngrok is running
- Update rule with current ngrok URL

**For Production:**
- Rule should forward to: `https://your-production-api.com/api/iot/webhook`

### Step 3: Check ngrok (For Local Testing)

If testing locally, ngrok must be running:

```bash
# Check if ngrok is running
ps aux | grep ngrok

# If not running, start it:
ngrok http 3000

# Update AWS IoT Core Rule with new ngrok URL
```

**Important:** If you restart ngrok, you get a new URL - update the IoT Core Rule!

### Step 4: Check MongoDB Connection

**Check server logs:**
- Look for: `✅ MongoDB Connected: mehulapi-cluster.4fkajzs.mongodb.net`
- If you see connection errors, fix `.env` file

**Verify MongoDB URI in .env:**
```bash
cat .env | grep MONGODB_URI
```

Should show:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority
```

### Step 5: Test Webhook Endpoint Directly

Test if your webhook endpoint works:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**If successful:**
- You'll see: `{"success": true, ...}`
- Data should appear in MongoDB Atlas
- This means API endpoint works

**If failed:**
- Check server logs for errors
- Verify MongoDB connection

### Step 6: Check Server Logs in Real-Time

Watch your server logs as device sends data:

```bash
# In terminal where npm run dev is running
# Watch for incoming requests

# You should see:
POST /api/iot/webhook 200
IoT data received and processed successfully
```

## Common Issues

### Issue 1: IoT Core Rule Not Set Up

**Symptom:** No logs in API when device sends data

**Solution:**
1. Set up AWS IoT Core Rule (see `IOT_CORE_RULE_SETUP.md`)
2. Forward `esp32/+` topics to your API webhook
3. For local: Use ngrok URL
4. For production: Use production API URL

### Issue 2: ngrok Not Running (Local Testing)

**Symptom:** Device sends data but API doesn't receive it

**Solution:**
```bash
# Start ngrok
ngrok http 3000

# Copy ngrok URL
# Update AWS IoT Core Rule with new URL
```

### Issue 3: Wrong Webhook URL in IoT Rule

**Symptom:** Data not reaching API

**Solution:**
1. Check IoT Core Rule → Actions
2. Verify HTTPS endpoint URL is correct
3. Must include `/api/iot/webhook` at the end
4. Must be HTTPS (not HTTP)

### Issue 4: MongoDB Connection Failed

**Symptom:** API receives data but doesn't save

**Solution:**
1. Check server logs for MongoDB errors
2. Verify `.env` file has correct `MONGODB_URI`
3. Check MongoDB Atlas network access
4. Verify credentials are correct

### Issue 5: Data Saved but Not Visible

**Symptom:** API saves data but MongoDB Atlas shows nothing

**Solution:**
1. Refresh MongoDB Atlas page
2. Check correct database: `mehulapi`
3. Check correct collection: `devicedatas`
4. Verify filter/search is not hiding data

## Debug Checklist

Go through this checklist:

- [ ] ✅ Server is running (`npm run dev`)
- [ ] ✅ MongoDB connected (check logs)
- [ ] ✅ AWS IoT Core Rule is set up
- [ ] ✅ IoT Rule forwards to correct URL
- [ ] ✅ ngrok running (if local testing)
- [ ] ✅ Webhook endpoint `/api/iot/webhook` works (test with curl)
- [ ] ✅ Server logs show incoming requests
- [ ] ✅ MongoDB Atlas network access allows connections
- [ ] ✅ Refresh MongoDB Atlas page to see data

## Test Complete Flow

Test the complete flow step by step:

### Test 1: API Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Expected:** Success response, data appears in MongoDB

### Test 2: Check MongoDB

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Refresh page
4. Should see saved data

### Test 3: Check API Logs

In terminal where `npm run dev` is running:
- Look for `POST /api/iot/webhook`
- Look for `Config published` (if config exists)
- Look for MongoDB connection status

## Quick Fix Commands

```bash
# Test webhook directly
./test-save-data.sh

# Check if ngrok is running
ps aux | grep ngrok

# Check MongoDB connection
curl http://localhost:3000/health

# View recent server logs (if logging to file)
tail -f /tmp/api-server.log
```

## Most Likely Issues

1. **AWS IoT Core Rule not set up** - Device sends to IoT Core but rule doesn't forward to API
2. **ngrok not running** (local) - IoT Core can't reach local API
3. **Wrong URL in IoT Rule** - Rule forwards to wrong endpoint
4. **MongoDB not connected** - API receives data but can't save

## Next Steps

1. Check server logs when device sends data
2. Verify AWS IoT Core Rule is configured
3. Test webhook endpoint directly
4. Check MongoDB connection

---

**Quick Test:** Run `./test-save-data.sh` - if this works, your API and MongoDB are fine. The issue is with IoT Core Rule forwarding data.


