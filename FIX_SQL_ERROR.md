# Fix SQL Error - messageId() Function Issue

## Error Message
```
InvalidRequestException
Errors encountered while validating query. 
ERROR: The provided function messageid does not exist
```

## Problem
The SQL query uses `messageId()` which is not a valid function in AWS IoT Core SQL.

## Solution: Remove messageId()

### Current SQL (WRONG):
```sql
SELECT *, topic() as topic, timestamp() as timestamp, messageId() as messageId FROM 'esp32/+'
```

### Corrected SQL (FIXED):
```sql
SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
```

**OR** (if you need a message ID, use this):

```sql
SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
```

---

## How to Fix

1. **Go back to Step 2: SQL statement**
   - Click "Edit" button next to "SQL statement" section

2. **Update the SQL query:**
   - Remove `, messageId() as messageId` from the SELECT statement
   - Should be:
   ```sql
   SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
   ```

3. **Click "Next"** to go back to Step 3

4. **Verify actions** (should already be correct):
   - URL: `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook`
   - Headers: `Content-Type: application/json`

5. **Click "Next"** to go to Step 4

6. **Review and click "Create"**

---

## Alternative: If You Need Message ID

If you really need a message ID, AWS IoT Core doesn't provide a `messageId()` function directly. You can:

1. **Remove messageId()** (simplest - recommended)
2. **Use payload structure** - message ID might be in the payload itself

For this setup, you don't need messageId(), so just remove it.

---

**Quick Fix: Remove `, messageId() as messageId` from SQL query!**

