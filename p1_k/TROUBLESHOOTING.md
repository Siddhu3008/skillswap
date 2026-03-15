# 🔧 Troubleshooting Guide

## ✅ Backend Status: RUNNING
- Port 5000: ✅ Active
- Health check: ✅ Working
- Node processes: ✅ Running

---

## If You Still See Errors:

### 1. **Hard Refresh Your Browser**
   - Press: **Ctrl + Shift + R** (or Ctrl + F5)
   - This clears cached errors

### 2. **Check Browser Console**
   - Press **F12** to open Developer Tools
   - Click **Console** tab
   - Look for red error messages
   - Share the error message with me

### 3. **Test Backend Directly**
   Open these URLs in your browser:
   - http://localhost:5000/api/health
   - Should show: `{"status":"ok","service":"SkillSwap API",...}`

### 4. **Clear Browser Cache**
   - Press **Ctrl + Shift + Delete**
   - Select "Cached images and files"
   - Click "Clear data"

### 5. **Check CORS Issues**
   If you see CORS errors in console:
   - Backend is configured for: `http://localhost:5173`
   - Make sure frontend is running on port 5173

---

## Common Issues:

### ❌ "Failed to fetch" or "Network error"
**Solution:**
1. Make sure backend is running (check terminal window)
2. Try: http://localhost:5000/api/health in browser
3. If it doesn't work, restart backend

### ❌ "CORS policy" error
**Solution:**
- Backend CORS is already configured
- Make sure frontend is on `localhost:5173`
- Restart backend if needed

### ❌ MongoDB connection errors
**This is OK!** The server will still work, just database features won't work.

### ❌ Port 5000 already in use
**Solution:**
1. Close other applications using port 5000
2. Or change port in `.env`: `PORT=5001`
3. Update frontend `API_BASE_URL` to match

---

## Quick Fixes:

### Restart Backend:
1. Close the backend terminal window
2. Open new PowerShell
3. Run:
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend"
   $env:PATH += ";$env:ProgramFiles\nodejs"
   npm run dev
   ```

### Restart Frontend:
1. Close frontend terminal
2. Open new PowerShell
3. Run:
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\frontend"
   npm run dev
   ```

---

## Still Not Working?

**Tell me:**
1. What error message do you see? (exact text)
2. What happens when you go to http://localhost:5000/api/health?
3. What's in the browser console? (F12 → Console tab)







