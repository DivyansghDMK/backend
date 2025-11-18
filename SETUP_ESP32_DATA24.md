# Setup Guide for esp32/data24 Topic

Complete setup for device sending data to `esp32/data24` topic.

## Your Device Configuration

**Topic:** `esp32/data24`

This means:
- Your device publishes to: `esp32/data24`
- Config updates will be sent to: `esp32/config24`

## AWS IoT Core Rule Setup

### SQL Query for Rule

When creating your AWS IoT Core Rule, use this SQL:

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**This matches:**
- ✅ `esp32/data24` (your device)
- ✅ `esp32/data25` (other devices)
- ✅ `esp32/anything` (all esp32 topics)

### Rule Action

**HTTPS Endpoint:**
- **For local testing:** `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- **For production:** `https://your-production-api.com/api/iot/webhook`

**HTTP Header:**
- Key: `Content-Type`
- Value: `application/json`

## Expected Message Format

Your device should publish this format:

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

**Topic:** `esp32/data24`

## Backend Processing

When your device sends data to `esp32/data24`:

1. **AWS IoT Core receives** the message
2. **IoT Core Rule forwards** to your API webhook
3. **Backend extracts:**
   - Device ID: `24` (from topic `esp32/data24`)
   - Device Type: Auto-detected (CPAP from MANUALMODE)
4. **Backend saves** to MongoDB:
   - Database: `mehulapi`
   - Collection: `devicedatas`
   - Device ID: `24`
5. **Backend checks** for pending config
6. **Backend publishes** config to `esp32/config24` (if config exists)

## Config Topic Mapping

When you set configuration for device `24`:

**Set config via API:**
```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0
    }
  }'
```

**Backend publishes to:** `esp32/config24`

**Your device should subscribe to:** `esp32/config24`

## Complete Flow for esp32/data24

```
ESP32 Device
    ↓ Publishes to: esp32/data24
AWS IoT Core
    ↓ Rule forwards (esp32/+ pattern matches)
Your API (/api/iot/webhook)
    ↓ Extracts device_id: "24" from topic
    ↓ Auto-detects: CPAP (from MANUALMODE)
    ↓ Saves to MongoDB
    ↓ Checks for config for device "24"
    ↓ Publishes to: esp32/config24
AWS IoT Core
    ↓ Delivers to subscribed device
ESP32 Device (subscribes to esp32/config24)
    ↓ Receives config update
✅ Hardware Updated!
```

## Testing

### Test 1: Direct API Test

Test if your API handles `esp32/data24` correctly:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "..."
  }
}
```

### Test 2: Via AWS IoT Test Client

1. **Go to:** AWS Console → IoT Core → Test (MQTT test client)
2. **Subscribe to:** `esp32/config24` (to see config updates)
3. **Publish to:** `esp32/data24` with your device data
4. **Check your server logs** - should see `POST /api/iot/webhook 200`
5. **Check MongoDB Atlas** - should see data with `device_id: "24"`

### Test 3: Set Configuration

```bash
# Set config for device 24
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
      "mode": "MANUALMODE"
    }
  }'
```

**Then send device data again** - backend will automatically publish config to `esp32/config24`

## Verify in MongoDB Atlas

After device sends data:

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Filter by: `device_id: "24"`
4. You should see all data from your device

## Device Configuration

Your ESP32 device should:

**Publish:**
- Topic: `esp32/data24`
- Message format: JSON with `device_status`, `device_data`

**Subscribe:**
- Topic: `esp32/config24`
- Receive: Configuration updates from backend

## Troubleshooting

### Data Not Reaching API

**Check:**
1. AWS IoT Core Rule SQL: Should match `esp32/+`
2. Rule Action URL: Should be your API webhook
3. ngrok running (if local testing)
4. Server logs show incoming requests

### Device ID Not Correct

**If device_id is wrong:**
- Backend extracts `24` from `esp32/data24`
- If you want different ID, include `device_id` in message payload

### Config Not Published

**Check:**
1. Config exists for device `24` in MongoDB
2. Config has `pending_update: true`
3. Backend logs show "Config published to IoT Core topic: esp32/config24"

---

**Your topic `esp32/data24` is perfect!** Just make sure:
1. ✅ AWS IoT Core Rule matches `esp32/+`
2. ✅ Device publishes to `esp32/data24`
3. ✅ Device subscribes to `esp32/config24`
4. ✅ Rule forwards to your API webhook


