# Can't Find Rules? Alternative Ways to Access

## Method 1: Use Direct URL (EASIEST!)

Open this URL directly in your browser:

```
https://us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/rules
```

**Or for any region:**
```
https://console.aws.amazon.com/iot/home?region=YOUR_REGION#/rules
```

Replace `YOUR_REGION` with your AWS region (e.g., `us-east-1`, `us-west-2`)

## Method 2: Use AWS Console Search

1. **Click the AWS search bar** at the top (next to AWS logo)
2. **Type:** `IoT Rules` or `IoT Core Rules`
3. **Click** on "IoT Rules" or "Rules (IoT Core)"
4. **This will take you directly to Rules page**

## Method 3: Check Under Message Routing

1. In AWS IoT Core console
2. Click **"Message routing"** (under "Manage" in left sidebar)
3. Look for tabs or sub-sections:
   - **Rules** (might be a tab)
   - **Message routing rules**
   - **Topic rules**
4. Click on it

## Method 4: Look for "Topic Rules" or "SQL Rules"

Sometimes AWS labels it differently:
- **Topic Rules**
- **SQL Rules**
- **Message Routing Rules**
- **IoT Rules**

## Method 5: Check Your Permissions

If you still can't see Rules:

1. **Check IAM permissions** - You need:
   - `iot:ListTopicRules`
   - `iot:CreateTopicRule`
   - `iot:GetTopicRule`
   - `iot:ReplaceTopicRule`
   - `iot:DeleteTopicRule`

2. **Or use full admin access** (for testing)

## Quick Check: What You Should See

When you find Rules, you should see:
- A list of existing rules (might be empty)
- A **"Create rule"** button (usually top right, orange/blue)
- A table showing rule names, SQL statements, and status

## Still Can't Find It?

### Option A: Create via AWS CLI

If you have AWS CLI installed:

```bash
aws iot create-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

We can create the rule document file if needed.

### Option B: Check AWS Region

Make sure you're in the correct region:
- Check top right corner of AWS console
- Should show: "United States (N. Virginia)" or your region
- Rules are region-specific

### Option C: Use AWS Console Mobile App

The mobile app sometimes shows different navigation - Rules might be easier to find there.

---

**Try Method 1 first (Direct URL) - it's the fastest!**

Copy and paste this in your browser:
```
https://us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/rules
```


