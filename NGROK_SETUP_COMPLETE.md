# Complete ngrok Setup - Next Steps

You're on the ngrok onboarding page. Here's what to do:

## Step 1: Complete ngrok Onboarding

1. **"How would you describe yourself?"**
   - Already selected: "Software Engineer (Development)" ✓

2. **"What are you interested in using ngrok for?"**
   - Already selected: "IoT Device Connectivity" ✓ (Perfect!)

3. **"Are you using ngrok for"**
   - Already selected: "Development" ✓

4. **Click:** "Continue" button (blue button at bottom)

## Step 2: Get Your Authtoken

After clicking "Continue", you'll be taken to the dashboard.

1. **Look for:** "Getting Started" or "Your Authtoken" section

2. **Or go directly to:**
   ```
   https://dashboard.ngrok.com/get-started/your-authtoken
   ```

3. **Copy your authtoken** (it looks like: `2abc123def456ghi789...`)

## Step 3: Configure ngrok with Authtoken

**In Terminal (where you'll run ngrok):**

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Replace `YOUR_AUTHTOKEN_HERE` with the authtoken you copied.

**Expected output:**
```
Authtoken saved to configuration file: /Users/deckmount/.ngrok2/ngrok.yml
```

## Step 4: Start ngrok

**In Terminal (new terminal - keep npm run dev running):**

```bash
ngrok http 3000
```

**You'll see output like:**
```
ngrok                                                                         
                                                                                
Session Status                online                                           
Account                       Your Name (Plan: Free)                          
Version                       3.x.x                                            
Region                        United States (us)                               
Latency                       50ms                                             
Web Interface                 http://127.0.0.1:4040                            
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
                                                                                
Connections                   ttl     opn     rt1     rt5     p50     p90      
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.io`)

## Step 5: Use ngrok URL in AWS IoT Core Rule

**Go back to AWS IoT Core Console (Step 3):**

1. **Click dropdown** "Choose an action"
2. **Select:** "Send a message to an HTTPS endpoint"
3. **URL:** `https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook`
   *(Replace YOUR-NGROK-URL with your actual ngrok URL)*
4. **Add HTTP header:**
   - Key: `Content-Type`
   - Value: `application/json`
5. **Click "Create role"** (if prompted)
6. **Click "Add action"**
7. **Click "Next"**

## Step 6: Complete Rule Creation

1. **Review settings** (Step 4)
2. **Click "Create"**

---

## Quick Checklist

- [ ] Complete ngrok onboarding (click "Continue")
- [ ] Get authtoken from ngrok dashboard
- [ ] Run: `ngrok config add-authtoken YOUR_AUTHTOKEN`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Copy HTTPS URL from ngrok output
- [ ] Go back to AWS IoT Core (Step 3)
- [ ] Fill in action with ngrok URL
- [ ] Complete rule creation

---

**Ready? Click "Continue" on the ngrok page, then follow the steps above!** 🚀

