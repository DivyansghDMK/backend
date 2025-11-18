# Step 3: Configure Action - Exact Steps

You're on **Step 3: Attach rule actions**. Here's what to do:

## Step 3A: Start ngrok First (IMPORTANT!)

**Before filling in the action, you need ngrok running to get the HTTPS URL!**

### Open a NEW Terminal (keep npm run dev running):

```bash
# Check if ngrok is authenticated
ngrok config check

# If not authenticated:
# 1. Go to: https://dashboard.ngrok.com/signup (sign up - it's free)
# 2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Copy your authtoken
# 4. Run:
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Start ngrok
ngrok http 3000
```

**You'll see output like:**
```
Forwarding: https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.io`)

---

## Step 3B: Configure Action in AWS Console

**Back in AWS Console (Step 3):**

1. **Click the dropdown** "Choose an action" (highlighted in red)

2. **Select from the dropdown:**
   - Look for: **"Send a message to an HTTPS endpoint"**
   - Click on it

3. **Configure HTTPS endpoint:**
   
   **URL:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook
   ```
   *(Replace YOUR-NGROK-URL with your actual ngrok URL from above)*
   
   **Example:** `https://abc123def456.ngrok.io/api/iot/webhook`

4. **HTTP Headers:**
   - Click **"Add HTTP header"** or **"Add header"**
   - **Key:** `Content-Type`
   - **Value:** `application/json`

5. **Confirmation required:**
   - Leave unchecked (unless you want confirmations)

6. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will automatically create an IAM role for HTTPS actions
   - Accept the default role name (e.g., `IoT_HTTPS_Action_Role`)

7. **Save the action:**
   - Click **"Add action"** or **"Next"** (if button appears)

8. **If you need to add more actions:** Click **"Add rule action"**
   - *(You only need one action for now)*

---

## Step 3C: Continue to Step 4

After adding the action, you should see:
- Action 1: "Send a message to an HTTPS endpoint" with your URL

**Then click:** **"Next"** button (bottom right)

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint with your ngrok URL

2. **Click:** **"Create"** button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Device sends data** to `esp32/data24`

2. **Check server logs** (where `npm run dev` is running):
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`

3. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** → Should see your data!

---

## Quick Checklist

- [ ] ngrok is running (Terminal 2)
- [ ] Copied ngrok HTTPS URL
- [ ] Selected "Send a message to an HTTPS endpoint"
- [ ] Entered URL: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- [ ] Added HTTP header: `Content-Type: application/json`
- [ ] Created IAM role (if prompted)
- [ ] Added action
- [ ] Clicked "Next"
- [ ] Reviewed settings
- [ ] Clicked "Create"

---

**Ready? Start with ngrok first, then fill in the action!** 🚀

