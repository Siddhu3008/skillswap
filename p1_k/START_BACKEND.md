# How to Start the Backend Server

## Problem: "Unable to reach SkillSwap servers. Make sure the backend is running on port 5000."

This error means the backend server is not running. Follow these steps:

---

## Step 1: Install Node.js (if not installed)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (recommended)
   - Run the installer

2. **Verify Installation:**
   - Open a **NEW** PowerShell/Command Prompt window
   - Run: `node --version`
   - Run: `npm --version`
   - Both should show version numbers

3. **Important:** Close and reopen your terminal after installing Node.js

---

## Step 2: Start the Backend Server

### Option A: Using PowerShell (Recommended)

1. Open PowerShell
2. Navigate to backend folder:
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend"
   ```

3. Start the server:
   ```powershell
   npm run dev
   ```

### Option B: Using the Start Script

1. Double-click: `start-backend.bat` (if it exists)
2. Or run in PowerShell:
   ```powershell
   .\start-backend.bat
   ```

---

## Step 3: Verify Backend is Running

You should see:
```
🚀 SkillSwap API running on port 5000
📡 Health check: http://localhost:5000/api/health
```

**If you see MongoDB errors:** That's OK! The server will still run, but database features won't work until MongoDB is installed.

---

## Step 4: Test the Connection

1. Open browser
2. Go to: http://localhost:5000/api/health
3. You should see: `{"status":"ok","service":"SkillSwap API",...}`

---

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js from https://nodejs.org/
- **Restart your terminal** after installation

### "Port 5000 already in use"
- Another application is using port 5000
- Close that application
- Or change port in `.env`: `PORT=5001`

### "Cannot find module"
- Dependencies not installed
- Run: `npm install` in the backend folder

### MongoDB Connection Errors
- This is OK for now!
- Server will still run
- Database features won't work until MongoDB is installed
- See `MONGODB_SETUP.md` for MongoDB installation

---

## Quick Commands Reference

```powershell
# Navigate to backend
cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend"

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Start production server
npm start
```

---

## Keep the Server Running

- **Don't close the terminal** where the server is running
- The server must stay running for the frontend to work
- To stop: Press `Ctrl+C` in the terminal

---

Once the backend is running, refresh your browser at `localhost:5173` and the error should be gone!







