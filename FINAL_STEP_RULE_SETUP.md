# Final Step: Put ngrok URL in AWS IoT Core Rule

Your ngrok is running! Here's exactly where to put the URL:

## Your ngrok URL

```
https://vina-unscrawled-krishna.ngrok-free.dev
```

## Complete URL to Use

```
https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
```

⚠️ **IMPORTANT:** Add `/api/iot/webhook` at the end!

---

## Steps: Go Back to AWS IoT Core Console

1. **Go to AWS Console tab**
   - Should be on: "Create rule | Step 3: Attach rule actions"

2. **Click dropdown "Choose an action"**
   - (Currently highlighted/visible in red border)

3. **Select:** "Send a message to an HTTPS endpoint"
   - Click on it

4. **Configure HTTPS endpoint:**

   **URL field:**
   ```
   https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
   ```
   *(Paste this exact URL)*

   **HTTP Headers:**
   - Click **"Add HTTP header"** or **"Add header"**
   - **Key:** `Content-Type`
   - **Value:** `application/json`

5. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will automatically create an IAM role
   - Accept the default role name

6. **Save the action:**
   - Click **"Add action"** button
   - Or click **"Next"** if button appears

7. **Continue to Step 4:**
   - Click **"Next"** button (bottom right)

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint → `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook`

2. **Click:** **"Create"** button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```
   (Should be running already)

2. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```
   (Should be running already - you see it in terminal)

3. **Device sends data** to `esp32/data24`

4. **Check server logs** (where `npm run dev` is running):
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`
   - Should see: `Config published to IoT Core topic: esp32/config24`

5. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** the page
   - You should see your device data!

---

## Summary

**Copy this exact URL:**
```
https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
```

**Paste it in:**
- AWS IoT Core Console
- Step 3: Attach rule actions
- Action: HTTPS endpoint
- URL field

**Then:**
- Add HTTP header: `Content-Type: application/json`
- Create role (if prompted)
- Add action
- Next → Review → Create

---

**Ready? Go back to AWS Console and paste the URL!** 🚀

