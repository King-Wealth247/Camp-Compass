# 🚀 Camp-Compass — Mobile App Deployment Guide

> This guide covers deploying the mobile app as a real Android APK/AAB that anyone can install — **no WiFi restriction, works anywhere in the world**.

---

## 📋 Overview

Deploying consists of **2 steps**:
1. **Deploy the backend** to the cloud (Vercel) — so the API is publicly accessible
2. **Build the APK** using EAS Build — the installable Android app file

---

## STEP 1 — Deploy Backend to Vercel

### Why?
The current backend runs on your PC (`localhost:3001`). For users to access the app from anywhere, the backend must be hosted on the internet.

### 1.1 — Push Code to GitHub (if not done)

```bash
cd Camp-Compass
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 — Deploy to Vercel

1. Go to **https://vercel.com** and sign in (create a free account if needed)
2. Click **"Add New Project"**
3. Select **"Import Git Repository"** → choose your `Camp-Compass` repo
4. Set the **Root Directory** to: `backend`
5. Framework: **Next.js** (auto-detected)
6. Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_YaCjV2Lr1kGE@ep-long-mode-b8sutibh-pooler.c-14.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |
| `DATABASE_URL_UNPOOLED` | `postgresql://neondb_owner:npg_YaCjV2Lr1kGE@ep-long-mode-b8sutibh.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `camp-compass-jwt-secret-2026` |
| `NEXTAUTH_SECRET` | `camp-compass-secret-2026` |
| `NODE_ENV` | `production` |

7. Click **Deploy** — Vercel builds and deploys in ~2 minutes
8. Copy your deployment URL, e.g.: `https://camp-compass-backend.vercel.app`

### 1.3 — Verify Backend is Live

Open in browser: `https://YOUR-VERCEL-URL.vercel.app/api/health`  
Should return: `{"status":"ok"}`

Also test login:
```
POST https://YOUR-VERCEL-URL.vercel.app/api/auth/login
Body: {"email":"admin@campcompass.edu","password":"password123"}
```

---

## STEP 2 — Update Mobile App to Use Deployed Backend

Edit `camp-compass-mobile/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-VERCEL-URL.vercel.app
EXPO_PUBLIC_APP_ENV=production
```

> **This is the critical step** — without this, the APK will try to connect to your local PC and fail for everyone else.

---

## STEP 3 — Build the Android APK with EAS

### 3.1 — Install EAS CLI

```bash
npm install -g eas-cli
```

### 3.2 — Login to Expo Account

```bash
eas login
# Enter your Expo account email and password
# Account: ebubarna1@gmail.com
```

> Create a free Expo account at https://expo.dev if you don't have one

### 3.3 — Configure EAS (Already Done ✅)

The `eas.json` file is already configured:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

### 3.4 — Build APK (Preview — Shareable Install File)

```bash
cd camp-compass-mobile
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo's build servers
- Build the APK in the cloud (~5-15 minutes)
- Give you a **download link** for the `.apk` file

### 3.5 — Download and Share the APK

When the build completes, you'll see:
```
✅ Build complete!
🔗 https://expo.dev/artifacts/eas/xxxxxxxx.apk
```

**Share this link** with anyone — they can download and install the APK on any Android device.

> ⚠️ Users need to enable **"Install from unknown sources"** in Android settings to install the APK

---

## STEP 4 — Production Build for Play Store (Optional)

### 4.1 — Build AAB (App Bundle for Google Play)

```bash
eas build --platform android --profile production
```

This generates a `.aab` file for submitting to Google Play Store.

### 4.2 — Submit to APKPure or Play Store

**APKPure** (free, no review needed):
1. Go to https://apkpure.com/developer
2. Create a developer account
3. Upload the `.apk` file from the preview build
4. Fill in app name, description, screenshots
5. Publish — app is live within hours

**Google Play Store** (needs $25 one-time registration):
1. Go to https://play.google.com/console
2. Create developer account
3. Upload the `.aab` file
4. Complete store listing
5. Submit for review (~2-3 days)

---

## STEP 5 — Over-the-Air Updates (OTA)

Once users have the APK installed, you can push **code updates** without them reinstalling:

```bash
# Publish an update (no new APK needed)
eas update --branch main --message "Bug fixes and improvements"
```

Users get the update automatically next time they open the app.

> This is configured via `expo-updates` in `app.json` — already set up ✅

---

## 📱 Quick Deployment Checklist

```
□ Backend deployed to Vercel
□ Vercel environment variables set (DATABASE_URL, JWT_SECRET, etc.)
□ Backend URL verified: /api/health returns {"status":"ok"}
□ camp-compass-mobile/.env updated with Vercel URL
□ eas login done
□ eas build --platform android --profile preview run
□ APK downloaded from Expo dashboard
□ APK tested on a real Android device
□ APK shared or uploaded to APKPure/Play Store
```

---

## 🔄 Updating the App After Deployment

### Small code changes (no native changes):
```bash
eas update --branch main --message "Description of changes"
```
→ Users see update next app launch (no reinstall needed)

### Changes to native modules or app.json:
```bash
eas build --platform android --profile preview
```
→ New APK/AAB, users need to reinstall

---

## 📊 Build Costs

| Service | Cost |
|---------|------|
| EAS Build (free tier) | 30 builds/month free |
| Vercel (free tier) | 100GB bandwidth/month free |
| Neon PostgreSQL (free tier) | 0.5 GB storage free |
| APKPure hosting | Free |
| Google Play Store | $25 one-time |

> **Total cost to deploy: $0** (using free tiers)

---

## 🆘 Deployment Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
# or
npx eas-cli build --platform android --profile preview
```

### Build fails with "Missing environment variable"
→ Check `eas.json` and make sure all env vars are set in EAS dashboard:  
https://expo.dev/accounts/[your-username]/projects/camp-compass-mobile/environment-variables

### APK installs but shows "Cannot connect to server"
→ Check `EXPO_PUBLIC_API_BASE_URL` in `.env` is set to the Vercel URL  
→ Rebuild the APK after changing `.env`

### Vercel deployment fails
→ Make sure Root Directory is set to `backend` in Vercel settings  
→ Check environment variables are all set  
→ Check build logs in Vercel dashboard

---

*Camp-Compass v1.1.0 | Expo SDK 58 | EAS Build*
