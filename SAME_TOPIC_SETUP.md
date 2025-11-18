# Setup for Same Topic Publish/Subscribe

Your device publishes AND subscribes on the same topic: `esp32/data24`

## Your Device Configuration

**Topic:** `esp32/data24` (for both publish and subscribe)

This means:
- ✅ Device publishes data to: `esp32/data24`
- ✅ Device subscribes to: `esp32/data24` (same topic)
- ✅ Backend sends config updates to: `esp32/data24` (same topic)

## How It Works

```
ESP32 Device
    ↓ Publishes data to: esp32/data24
AWS IoT Core
    ↓ Rule forwards to your API
Your API (/api/iot/webhook)
    ↓ Saves to MongoDB
    ↓ Checks for config
    ↓ Publishes config to: esp32/data24 (SAME TOPIC!)
AWS IoT Core
    ↓ Delivers to esp32/data24
ESP32 Device (subscribes to esp32/data24)
    ↓ Receives config update
✅ Device Updated!
```

## Backend Configuration

The backend is now configured to publish config updates to the **same topic** your device uses.

**When device sends data to `esp32/data24`:**
- Backend receives it
- Backend saves to MongoDB
- Backend checks for pending config
- **Backend publishes config to `esp32/data24`** (same topic)
- Your device receives it on the same topic it subscribes to!

## Testing

### Test 1: Send Data (Device Publishes)

**Your device publishes to `esp32/data24`:**
```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

**Backend receives, saves, and publishes config back to same topic!**

### Test 2: Set Configuration

```bash
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

**Next time device sends data:**
- Backend publishes config to `esp32/data24`
- Device receives config on same topic!

### Test 3: Verify in AWS IoT Test Client

1. **Subscribe to:** `esp32/data24` (same topic)
2. **Publish test data** to `esp32/data24`
3. **You should see:**
   - Your published data (device data)
   - Config update message (from backend)

## AWS IoT Core Rule Setup

**SQL Query:**
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/data24'
```

**Or match all esp32 topics:**
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**Action:** HTTPS endpoint → Your API webhook URL

## Message Flow

### Device → Backend (Data Publishing)

**Device publishes:**
- Topic: `esp32/data24`
- Message: `{ "device_status": 0, "device_data": "..." }`

**Backend receives:**
- At `/api/iot/webhook`
- Extracts device_id: `24`
- Saves to MongoDB
- Checks for config

### Backend → Device (Config Publishing)

**If config exists, backend publishes:**
- Topic: `esp32/data24` (SAME TOPIC!)
- Message:
```json
{
  "device_id": "24",
  "config": {
    "pressure": 16.0,
    "humidity": 7.0,
    "mode": "MANUALMODE"
  },
  "timestamp": "2025-11-18T...",
  "action": "config_update"
}
```

**Device receives:**
- On subscribed topic: `esp32/data24`
- Processes config update

## Important Notes

### 1. Message Identification

Since both device data and config use same topic, your device should:

**Identify message type:**
- Device data: Has `device_data` field
- Config update: Has `config` field and `action: "config_update"`

**Example device code logic:**
```javascript
// Pseudo-code
if (message.device_data) {
  // This is device data we sent - ignore
} else if (message.config && message.action === "config_update") {
  // This is config update from backend
  updateDeviceConfig(message.config);
}
```

### 2. Avoid Loops

Make sure your device:
- ✅ **Publishes** device data
- ✅ **Subscribes** to same topic
- ✅ **Ignores** messages it publishes (check message ID or sender)
- ✅ **Processes** config updates from backend

## Troubleshooting

### Device Receives Its Own Data

**Problem:** Device receives its own published data back

**Solution:** In device code, filter messages:
- Check if message has `device_data` (you sent it)
- Only process messages with `config` field (from backend)

### Config Not Being Received

**Check:**
1. Config exists for device `24` with `pending_update: true`
2. Backend logs show: `Config published to IoT Core topic: esp32/data24`
3. Device is subscribed to `esp32/data24`
4. Check AWS IoT Test Client to see if config message appears

### Both Messages on Same Topic

**Solution:** Use message fields to differentiate:
- **Device data:** `{ device_status, device_data, ... }`
- **Config update:** `{ device_id, config, action: "config_update", ... }`

## Alternative: Use Different Topics (If Needed)

If you want separate topics (recommended for clarity):

**Device:**
- Publishes to: `esp32/data24`
- Subscribes to: `esp32/config24`

**Backend:** Already configured to use `esp32/config24` for config updates (just uncomment the code in iotController.js)

---

**Your setup is now configured for same topic!** The backend will publish config updates to `esp32/data24` - the same topic your device subscribes to.


