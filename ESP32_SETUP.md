# ESP32 Device Setup Guide

This guide shows how to configure the backend to work with ESP32 devices that publish to `esp32/*` topics.

## Topic Format

ESP32 devices use this topic format:
- **Data Publishing**: `esp32/data24` (or `esp32/24`)
- **Config Subscription**: `esp32/config24` (or `esp32/config24`)

## Device Data Format

Your ESP32 device is sending data like this:

```json
{
  "device_status": 1,
  "device_data": "*,S,151125,1734,VAPS_MODE,A,15.0,1.0,B,6.0,4.0,4.0,2.0,30.0,1.0,50.0,1.0,C,6.0,4.0,4.0,10.0,10.0,20.0,0.0,200.0,1.0,D,11.4,10.0,10.0,10.0,10.0,10.0,10.0,200.0,1.0,E,20.0,10.0,5.0,10.0,10.0,20.0,1.0,200.0,1.0,170.0,500.0,F,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

## Setup Steps

### 1. Create AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name**: `ForwardESP32DataToBackend`
   - **SQL Version**: 2016-03-23
   - **SQL Statement**:
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```

4. **Add Action**: "Send a message to an HTTPS endpoint"
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: `Content-Type: application/json`
   - Create IAM role if prompted

5. Save the rule

### 2. Configure ESP32 Device

Your ESP32 device should:
- **Publish to**: `esp32/data24` (or `esp32/24`)
- **Subscribe to**: `esp32/config24` (to receive config updates)

### 3. How It Works

1. **Device sends data** → Publishes to `esp32/data24`
2. **IoT Core Rule** → Forwards to backend `/api/iot/webhook`
3. **Backend** → 
   - Extracts device ID from topic (e.g., `24` from `esp32/data24`)
   - Auto-detects device type (BIPAP from VAPS_MODE)
   - Parses and saves data to MongoDB
   - Checks for pending config updates
4. **If config exists** → Publishes to `esp32/config24`
5. **Device receives** → Config update on subscribed topic

## Setting Configuration for ESP32 Device

### Option 1: Using Device ID

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "BIPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 6.0,
      "mode": "VAPS_MODE"
    }
  }'
```

This will:
1. Save config to MongoDB with `device_id: "24"`
2. When device sends next data, backend publishes to `esp32/config24`

### Option 2: Using API to Publish Directly

You can also publish directly to the esp32 topic:

```javascript
// In your backend code or API
import { publishDeviceConfigToTopic } from './config/awsIoT.js';

await publishDeviceConfigToTopic(
  'esp32/config24',  // Target topic
  '24',              // Device ID
  {
    pressure: 16.0,
    humidity: 6.0,
    mode: 'VAPS_MODE'
  }
);
```

## Testing

### Test 1: Verify Data Reception

1. ESP32 device publishes to `esp32/data24`
2. Check backend logs - should see:
   ```
   IoT data received and processed successfully
   Config published to IoT Core topic: esp32/config24
   ```
3. Check MongoDB - data should be saved

### Test 2: Verify Config Publishing

1. Set configuration via API:
```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "BIPAP",
    "config_values": {"pressure": 18.0}
  }'
```

2. Subscribe to `esp32/config24` in AWS IoT Test Client
3. ESP32 device sends next data
4. You should see config message on `esp32/config24` topic

### Test 3: End-to-End Flow

1. ESP32 sends data → Backend receives and saves
2. Admin sets config via API → Config saved, `pending_update: true`
3. ESP32 sends next data → Backend publishes config to `esp32/config24`
4. ESP32 receives config → Updates hardware settings

## Device ID Mapping

The backend automatically extracts device ID from topic:

| Topic | Extracted Device ID |
|-------|---------------------|
| `esp32/data24` | `24` |
| `esp32/24` | `24` |
| `esp32/data001` | `001` |
| `devices/cpap_001/data` | `cpap_001` |

## Config Topic Mapping

When config is published, topic is determined by data topic:

| Data Topic | Config Topic |
|------------|--------------|
| `esp32/data24` | `esp32/config24` |
| `esp32/24` | `esp32/config24` |
| `devices/cpap_001/data` | `devices/cpap_001/config/update` |

## Troubleshooting

### Data not reaching backend

1. Check IoT Core Rule is active
2. Verify rule SQL matches `esp32/+` pattern
3. Check webhook URL is accessible
4. Review CloudWatch logs for rule errors

### Config not being published

1. Verify device ID matches in MongoDB config
2. Check `pending_update` is `true`
3. Review backend logs for publish errors
4. Verify AWS credentials are correct

### Device not receiving config

1. Verify device is subscribed to `esp32/config24`
2. Check device certificate permissions
3. Test publish manually using AWS IoT Test Client
4. Verify topic name matches exactly

## Next Steps

1. Set up IoT Core Rule (see above)
2. Configure ESP32 device certificates in AWS IoT
3. Update ESP32 firmware to use correct topics
4. Test the complete flow
5. Monitor logs and set up alerts

