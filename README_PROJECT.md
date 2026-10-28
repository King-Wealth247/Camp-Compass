# 🧭 Camp-Compass — Complete Project Documentation

> University Campus Mapping & Timetable Management System  
> Stack: Next.js (backend API) · Next.js (web dashboard) · React Native / Expo SDK 58 (mobile) · Neon PostgreSQL

---

## 📁 Project Structure

```
Camp-Compass/
├── backend/                  ← Next.js 16 API server  (port 3001)
│   ├── app/api/              ← REST API route handlers
│   ├── lib/                  ← Auth (JWT + bcrypt), Prisma client
│   ├── prisma/               ← DB schema, migrations, seed scripts
│   └── .env                  ← DB connection + secrets (never commit)
│
├── camp-compass/             ← Web dashboard (admin / staff / registrar)
│   ├── src/app/              ← Next.js pages + API context
│   ├── src/components/       ← UI components (LoginPage, Dashboard…)
│   └── src/lib/              ← authService, API client
│
└── camp-compass-mobile/      ← React Native / Expo mobile app
    ├── app/                  ← Expo Router file-based screens
    │   ├── (app)/admin/      ← Admin screens
    │   ├── (app)/staff/      ← Staff screens
    │   ├── (app)/student/    ← Student screens
    │   └── (app)/registrar/  ← Registrar screens
    ├── components/           ← AppShell, SyncStatusBanner
    ├── context/              ← AuthContext, ThemeContext
    ├── lib/                  ← offlineQueue, pushNotifications, dataService
    └── .env                  ← API base URL (change for production!)
```

---

## ⚙️ Prerequisites

| Tool | Minimum Version | Download |
|------|-----------------|----------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | Bundled with Node |
| Git | Any | https://git-scm.com |
| Expo Go (phone) | SDK 58 | Google Play / App Store |

---

## 🚀 Running Locally — Step by Step

### 1. Clone the Repository

```bash
git clone https://github.com/King-Wealth247/Camp-Compass.git
cd Camp-Compass
```

---

### 2. Start the Backend (Required First)

```bash
cd backend
npm install
npm run dev
```

✅ Ready when terminal shows: `✓ Ready in XXXms` on port **3001**

**Backend `.env` file** (create at `backend/.env`):
```env
DATABASE_URL=postgresql://neondb_owner:npg_YaCjV2Lr1kGE@ep-long-mode-b8sutibh-pooler.c-14.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_YaCjV2Lr1kGE@ep-long-mode-b8sutibh.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=camp-compass-jwt-secret-2026
NEXTAUTH_SECRET=camp-compass-secret-2026
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=development
```

---

### 3. Start the Web Dashboard (Optional)

```bash
cd camp-compass
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

> The web dashboard auto-connects to the backend on port 3001.

---

### 4. Start the Mobile App (Expo)

```bash
cd camp-compass-mobile
npm install
```

**Configure the API URL** — edit `camp-compass-mobile/.env`:

```env
# ✅ FOR LOCAL DEVELOPMENT (phone on same WiFi as PC):
EXPO_PUBLIC_API_BASE_URL=http://YOUR_PC_IP:3001
EXPO_PUBLIC_APP_ENV=development

# ✅ FOR PRODUCTION (deployed backend - works everywhere):
# EXPO_PUBLIC_API_BASE_URL=https://camp-compass-backend.vercel.app
# EXPO_PUBLIC_APP_ENV=production
```

> **Find your PC's IP address:**
> - Windows: Run `ipconfig` → look for **IPv4 Address** (e.g. `192.168.1.105`)
> - Mac/Linux: Run `ifconfig` or `ip addr`

**Start Metro bundler:**
```bash
npx expo start --lan --clear
```

**Connect your phone:**
1. When the login prompt appears in terminal → press **↓ arrow** → **Enter** (Proceed anonymously)
2. Open **Expo Go** on your Android/iOS phone
3. Scan the QR code shown in the terminal
4. The app loads on your phone 🎉

---

### ⚠️ WiFi Requirement for Local Development

> **This only applies when running locally!**  
> When you install the published APK/AAB, users can connect from **any network, anywhere** — as long as the backend is deployed to the cloud.

When developing locally:
- Your phone must be on the **same WiFi network** as your PC
- Your PC IP must be correctly set in `camp-compass-mobile/.env`
- The backend must be running (`npm run dev` in `/backend`)

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@campcompass.edu` | `password123` |
| **Lecturer / Staff** | `dr.sarah.mensah@campcompass.edu` | `password123` |
| **Student** | `kofi.acheampong@student.campcompass.edu` | `password123` |
| **Registrar** | `registrar@campcompass.edu` | `password123` |

> 💡 **Quick Tip:** On the mobile login screen, tap any **Quick Demo** card to instantly log in as that role — no typing needed!

---

## 📱 Feature Guide by Role

### 🎓 Student
| Feature | Description |
|---------|-------------|
| Dashboard | Upcoming classes today, quick stats |
| Timetable | Full weekly schedule with room & lecturer info |
| Campus Map | Interactive 3D map — find your classroom |
| Notifications | Real-time alerts for timetable changes |

### 👨‍🏫 Staff / Lecturer
| Feature | Description |
|---------|-------------|
| Dashboard | Today's classes, quick overview |
| My Timetable | All assigned courses and rooms |
| Availability | Submit available time slots for scheduling |
| Notifications | Receive timetable updates |

### 🛡️ Admin
| Feature | Description |
|---------|-------------|
| Dashboard | System overview, stats |
| Timetable Management | Generate AI-scheduled timetables, publish |
| Infrastructure | Manage buildings, lecture halls, rooms |
| Submissions | Review staff availability |
| Notifications | Send announcements to all users |

### 📋 Registrar
| Feature | Description |
|---------|-------------|
| Register Student | Add new student to system |
| Register Staff | Add new staff/lecturer |
| User Management | View and manage all accounts |

---

## 🌐 API Reference

Base URL (local): `http://localhost:3001`  
Base URL (production): `https://camp-compass-backend.vercel.app`

| Method | Endpoint | Description | Who |
|--------|----------|-------------|-----|
| `POST` | `/api/auth/login` | Login with email + password | All |
| `GET` | `/api/auth/me` | Get logged-in user profile | All |
| `GET` | `/api/timetable` | Get current timetable | All |
| `POST` | `/api/timetable/generate` | Auto-generate timetable | Admin |
| `GET` | `/api/timetable/publish` | Published timetable list | All |
| `POST` | `/api/timetable/publish` | Publish a timetable | Admin |
| `GET` | `/api/halls` | List all halls/rooms | All |
| `GET` | `/api/halls/free` | Find free rooms | All |
| `GET` | `/api/users` | List all users | Admin |
| `POST` | `/api/users/register` | Register new user | Registrar |
| `GET` | `/api/notifications` | Get notifications | All |
| `POST` | `/api/availability` | Submit availability | Staff |
| `GET` | `/api/health` | Server health check | Public |

---

## 📶 Offline Mode — How It Works

Camp-Compass is **offline-first** — data is never lost even without internet:

1. **Reading data offline** → App serves cached data from local storage
2. **Writing data offline** → Changes are queued locally
3. **Back online** → Queue auto-drains and syncs to Neon DB
4. **Visual indicator** → Banner shows Online/Offline/Syncing status

---

## 🗄️ Database Commands

```bash
cd backend

# Run pending migrations
npx prisma migrate deploy

# Re-seed test data (reset + populate)
npx tsx prisma/quickSeed.ts

# Open visual database browser
npx prisma studio         # Opens at http://localhost:5555

# Debug auth / password issues
npx tsx prisma/debugAuth.ts
```

---

## 🛠️ Full Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile | React Native + Expo SDK 58 | iOS & Android app |
| Routing | Expo Router (file-based) | Navigation |
| Web Dashboard | Next.js 16 + TypeScript | Admin web portal |
| Backend API | Next.js API Routes | REST endpoints |
| Database ORM | Prisma 5.5 | Type-safe DB access |
| Database | Neon PostgreSQL | Cloud-hosted Postgres |
| Auth | JWT (bcryptjs) — 7d expiry | Secure login |
| Offline Sync | AsyncStorage + NetInfo | Offline-first support |
| Push Notifications | Expo Notifications | Real-time alerts |
| 3D Map | Three.js (in WebView) | Campus visualization |
| Styling | StyleSheet (RN) + Tailwind (Web) | UI styling |

---

## ❓ Troubleshooting

### "Cannot connect to server" on phone
→ Check `camp-compass-mobile/.env` has your correct PC IP  
→ Run `ipconfig` and update `EXPO_PUBLIC_API_BASE_URL`  
→ Make sure phone is on same WiFi as PC  
→ Make sure backend is running (`npm run dev` in `/backend`)

### "SDK mismatch" error in Expo Go  
→ Update Expo Go to latest version on Play Store  
→ Should be **SDK 58**

### Metro cache issues
```bash
npx expo start --lan --clear   # --clear rebuilds the bundle cache
```

### "Wrong credentials"
→ Use `password123` for all test accounts  
→ Or tap Quick Demo cards on login screen

### Port 3001 already in use
```bash
# Windows PowerShell:
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
npm run dev
```

### Database connection failed
→ Check your `backend/.env` has the correct `DATABASE_URL`  
→ Neon DB is cloud-hosted — needs internet access

---

*Generated: October 2026 | Camp-Compass v1.1.0 | Expo SDK 58*
