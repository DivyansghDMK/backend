#!/bin/bash

echo "🔧 Update IoT Rule to Use POST Method"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found!"
    echo "Install with: brew install awscli"
    exit 1
fi

echo "✅ AWS CLI found"
echo ""

# Create update payload
cat > /tmp/rule-update.json << 'JSON'
{
  "ruleName": "ForwardESP32DataToBackend",
  "sql": "SELECT device_status, device_data, device_type, device_id, topic() as topic, timestamp() as timestamp FROM 'esp32/+'",
  "description": "Forward ESP32 data to backend API",
  "actions": [
    {
      "http": {
        "url": "https://backend-production-9c17.up.railway.app/api/iot/webhook",
        "confirmationUrl": "",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ]
      }
    }
  ]
}
JSON

echo "📋 Updating rule..."
echo ""

# Update the rule
aws iot replace-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file:///tmp/rule-update.json

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rule updated successfully!"
    echo ""
    echo "🧪 Next: Test with MQTT Test Client"
    echo "   1. Publish to: esp32/data24"
    echo "   2. Check Railway logs"
    echo "   3. Check MongoDB"
else
    echo ""
    echo "❌ Failed to update rule"
    echo "Check AWS credentials: aws configure"
fi

# Cleanup
rm -f /tmp/rule-update.json

