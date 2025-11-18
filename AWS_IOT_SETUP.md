# AWS IoT Core Integration Guide

This guide explains how to integrate AWS IoT Core with the CPAP/BIPAP API backend.

## Architecture Flow

```
Device → AWS IoT Core → Backend API → MongoDB
                            ↓
                    Check for Pending Config
                            ↓
                    AWS IoT Core → Device
```

## Prerequisites

1. AWS Account with IoT Core enabled
2. AWS IAM user/role with IoT Core permissions
3. Backend API deployed and accessible via HTTPS (required for IoT Core HTTPS action)
4. Device certificates for AWS IoT Core (for device connection)

## Setup Steps

### 1. Configure AWS Credentials

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

**How to find your IoT Endpoint:**
1. Go to AWS Console → IoT Core → Settings
2. Copy the "Device data endpoint" (without `https://`)

### 2. Set Up Device Topics

Configure your devices to publish to these topics:

**Device Data:**
- Topic: `devices/{device_id}/data`
- Example: `devices/cpap_001/data`

**Device Config (for receiving updates):**
- Topic: `devices/{device_id}/config/update`
- Example: `devices/cpap_001/config/update`

**Device Acknowledgment:**
- Topic: `devices/{device_id}/ack`
- Example: `devices/cpap_001/ack`

### 3. Create IoT Core Rule (Option A: HTTPS Action)

This is the recommended approach for production.

#### Step 1: Create IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Name: `ForwardDeviceDataToBackend`
4. SQL Version: 2016-03-23
5. SQL Statement:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'devices/+/data'
```

#### Step 2: Configure HTTPS Action

1. Under "Actions", click "Add action" → "Send a message to an HTTPS endpoint"
2. Configure:
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Authentication**: 
     - Use SigV4 if your API is behind AWS API Gateway
     - Or configure custom headers with API key if needed

3. Click "Create role" if needed (IoT Core will create IAM role for HTTPS action)
4. Save the rule

#### Step 3: Test the Rule

1. Use AWS IoT Test client or MQTT client to publish a test message:
   - Topic: `devices/test_device/data`
   - Message:
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "test_device"
}
```

2. Check your backend API logs to verify the message was received

### 4. Create IoT Core Rule (Option B: Lambda Function)

Alternative approach using Lambda function.

#### Step 1: Create Lambda Function

1. Go to AWS Lambda → Create function
2. Use the code from `aws-iot/lambda-function.js`
3. Set environment variable:
   - `BACKEND_API_URL`: `https://your-api-domain.com`
4. Configure timeout: 30 seconds (or more if needed)
5. Set memory: 256 MB (or more)

#### Step 2: Create IoT Core Rule

1. Go to IoT Core → Rules → Create rule
2. SQL Statement (same as Option A)
3. Action: "Send a message to a Lambda function"
4. Select your Lambda function
5. Save

### 5. Configure Device Publishing

Your hardware devices should publish messages to AWS IoT Core in this format:

```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

**Topic:** `devices/{device_id}/data`

### 6. Configure Device Subscription

Devices need to subscribe to config update topics to receive configuration changes:

**Subscribe to:** `devices/{device_id}/config/update`

When the backend has a configuration update, it will publish to this topic, and your device will receive it.

## API Endpoints

### 1. IoT Webhook (for AWS IoT Core)

**Endpoint:** `POST /api/iot/webhook`

This endpoint receives data from AWS IoT Core Rule Action (HTTPS).

**Request Format (from IoT Core):**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001",
  "topic": "devices/cpap_001/data",
  "timestamp": "2024-01-01T12:00:00Z",
  "messageId": "msg-12345"
}
```

### 2. Set Device Configuration (Publishes to IoT Core)

**Endpoint:** `POST /api/devices/:deviceId/config`

When you set a device configuration, it automatically publishes to AWS IoT Core:

**Request:**
```json
{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 14.0,
    "humidity": 6.0
  }
}
```

**What happens:**
1. Config is saved to MongoDB
2. Config is published to IoT Core topic: `devices/{deviceId}/config/update`
3. Device receives the config update

## Testing

### Test IoT Webhook Locally

You can test the webhook endpoint directly:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 1,
    "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
    "device_type": "CPAP",
    "device_id": "test_cpap_001",
    "topic": "devices/test_cpap_001/data"
  }'
```

### Test Config Publishing

```bash
# Set configuration (will publish to IoT Core)
curl -X POST http://localhost:3000/api/devices/test_cpap_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 14.0,
      "humidity": 6.0
    }
  }'
```

Check your IoT Core logs to verify the message was published.

## Troubleshooting

### Messages not reaching backend

1. **Check IoT Core Rule:**
   - Verify rule SQL matches your topic pattern
   - Check rule status (should be Active)
   - Review CloudWatch logs for rule errors

2. **Check HTTPS Action:**
   - Verify URL is correct and accessible
   - Check IAM role permissions
   - Review API Gateway logs if using API Gateway

3. **Check Backend API:**
   - Verify endpoint `/api/iot/webhook` is accessible
   - Check server logs for incoming requests
   - Verify CORS settings if accessing from browser

### Config not being published

1. **Check Environment Variables:**
   - Verify `AWS_IOT_ENDPOINT` is set
   - Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Verify `AWS_REGION` matches your IoT Core region

2. **Check IAM Permissions:**
   - Verify IAM user/role has `iot:Publish` permission
   - Check IoT Core policy allows publishing to topics

3. **Check Backend Logs:**
   - Look for error messages about IoT publishing
   - Verify config exists and `pending_update` is true

### Device not receiving config

1. **Check Device Subscription:**
   - Verify device is subscribed to `devices/{device_id}/config/update`
   - Check device certificate permissions allow subscribing

2. **Check IoT Core Publishing:**
   - Verify config was published successfully
   - Check IoT Core test client to see if message is in topic
   - Review CloudWatch logs for IoT Core

## Security Best Practices

1. **Use IAM Roles:** Instead of access keys, use IAM roles when possible
2. **Secure Device Certificates:** Keep device certificates secure
3. **Use TLS/SSL:** Always use HTTPS for IoT Core connections
4. **Topic Policies:** Restrict device access to their own topics only
5. **API Authentication:** Add API key or JWT authentication to webhook endpoint if needed
6. **Encryption:** Enable encryption at rest and in transit

## Cost Optimization

1. **Rule Filtering:** Use SQL WHERE clauses to filter unnecessary messages
2. **Batch Processing:** Process multiple messages together if possible
3. **Message Size:** Keep message payloads small
4. **Monitor Usage:** Set up CloudWatch alarms for IoT Core usage

## Next Steps

1. Set up device certificates in AWS IoT Core
2. Configure device firmware to connect to IoT Core
3. Set up CloudWatch monitoring and alarms
4. Configure backup and disaster recovery
5. Set up logging and monitoring

## Additional Resources

- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/)
- [AWS IoT Core Rules](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules.html)
- [AWS IoT SDKs](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sdks.html)

