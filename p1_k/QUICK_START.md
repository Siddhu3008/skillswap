# ✅ Quick Start Guide - SkillSwap

## 🎉 Good News!
**Node.js is already installed on your system!** (v24.11.1)

---

## 🚀 Start the Backend Server

### Method 1: Double-Click (Easiest)
1. Go to: `C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend`
2. Double-click: **`start-backend.bat`**
3. A window will open showing the server running
4. **Keep this window open!** (Don't close it)

### Method 2: PowerShell
1. Open PowerShell
2. Run these commands:
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend"
   npm run dev
   ```
3. **Keep this window open!**

---

## ✅ Verify Backend is Running

You should see:
```
🚀 SkillSwap API running on port 5000
📡 Health check: http://localhost:5000/api/health
```

**Test it:** Open http://localhost:5000/api/health in your browser

---

## 🌐 Start the Frontend (if not already running)

1. Open a **NEW** PowerShell window
2. Run:
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\frontend"
   npm run dev
   ```

---

## 🎯 Access Your App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

---

## ⚠️ Important Notes

1. **Keep both servers running** - Don't close the terminal windows
2. **MongoDB errors are OK** - Server will still run, but database features won't work until MongoDB is installed
3. **Refresh your browser** after starting the backend

---

## 🔧 If Backend Won't Start

1. Make sure you're in the backend folder
2. Run: `npm install` (if dependencies are missing)
3. Check if port 5000 is free (close other apps using it)

---

## 📝 What's Installed

✅ Node.js v24.11.1  
✅ npm v11.6.2  
✅ Backend dependencies (node_modules exists)  
✅ Frontend dependencies (node_modules exists)  

**You're ready to go!** Just start the servers and refresh your browser.







