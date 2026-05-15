# Camp-Compass 🎓📱

**Camp-Compass** is a comprehensive, multi-platform campus management system for university administration. It provides role-based interactive dashboards for **Students**, **Staff**, **Admins**, and **Registrars** to manage timetables, interactive campus maps, classroom availability, and real-time notifications.

**Project Status:** Phase 2 Complete - Core Features Implemented (v0.1.0)
**Last Updated:** May 15, 2026

---

## � Overview

Camp-Compass is a fully-functional full-stack application consisting of:
- **Backend:** Next.js REST API with PostgreSQL, Prisma ORM, JWT authentication, RBAC, and Firebase notifications
- **Web Frontend:** React + Next.js with Tailwind CSS for desktop/tablet users with 12+ feature pages
- **Mobile Frontend:** React Native (Expo) with Firebase integration for iOS and Android users

All platforms share:
- Common JWT-based authentication with role-based access control
- Real-time Firebase notification integration
- Integrated timetable viewing with campus map deep-linking
- Multi-institutional support with user management

---

## 🚀 Features

- **Role-based Authentication:** Secure portal access with tailored views for Student, Staff, Admin, or Registrar roles
- **Smart Timetables:** Automated scheduling and live updates for students and lecturers
- **Interactive Campus Maps:** Navigate indoor and outdoor spaces, view building floor plans, locate lecture halls
- **Classroom Availability:** Real-time availability matrix for staff and resource planning
- **Real-time Notifications:** In-app alert system for timetable changes, system updates, and urgent messages
- **Management Portals:** User registration, profile management, and administrative oversight
- **Multi-Platform Support:** Works seamlessly on web browsers, iOS, and Android devices

---

## 🛠️ Tech Stack

### Backend (`/backend`)
- **[Next.js 16](https://nextjs.org/)** — Full-stack JavaScript framework with API routes
- **[Prisma 5.5](https://www.prisma.io/)** — Modern ORM for database access and migrations
- **[PostgreSQL 14+](https://www.postgresql.org/)** — Production database
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Password hashing library
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** — JWT token generation and validation
- **[TypeScript 5.5](https://www.typescriptlang.org/)** — Type-safe JavaScript development

### Web Frontend (`/camp-compass`)
- **[React 19](https://react.dev/)** — Modern React with hooks
- **[Next.js 16](https://nextjs.org/)** — React framework with file-based routing
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** — Headless UI components
- **[TypeScript 5.5](https://www.typescriptlang.org/)** — Type-safe frontend development

### Mobile Frontend (`/camp-compass-mobile`)
- **[React Native 0.81](https://reactnative.dev/)** — Cross-platform mobile framework
- **[Expo 54](https://expo.dev/)** — Managed React Native development platform
- **[Expo Router 6](https://docs.expo.dev/router/)** — File-based routing for React Native
- **[React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** — Local persistence
- **[Lucide React Native](https://lucide.dev/)** — Cross-platform icons
- **[TypeScript 5.9](https://www.typescriptlang.org/)** — Type-safe mobile development

---

## � Getting Started for Team Members

### Phase 1: Prerequisites (Same for all team members)

#### System Requirements
- **Node.js** v18 or higher (verify with `node --version`)
- **npm** v8+ (comes with Node.js)
- **Git** for version control
- **PostgreSQL 14+** (for backend local development)

#### Optional (for mobile development)
- **Expo Go** app on iOS/Android (for testing mobile without emulator)
- **Android Studio** (if you want to run Android emulator)
- **Xcode** (macOS only, for iOS development)

### Phase 2: Initial Setup (Follow Once)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/King-Wealth247/Camp-Compass.git
cd Camp-Compass
```

#### Step 2: Database Setup (Backend Development Only)

**Install PostgreSQL** (if not already installed):
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql@14`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

**Create a local database**:
```bash
psql -U postgres
CREATE DATABASE camp_compass_dev;
\q
```

**Create `.env.local` in `/backend` folder**:
```bash
cd backend
touch .env.local  # or create manually if on Windows
```

Add the following environment variables:
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/camp_compass_dev"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Environment
NODE_ENV=development
PORT=3001
```

**Note:** Replace `your_password` with your PostgreSQL password set during installation.

#### Step 3: Install Dependencies

**Backend Setup**:
```bash
cd backend
npm install
npx prisma migrate dev --name init  # Create database schema
npm run dev  # Start backend on http://localhost:3001
```

**Web Frontend Setup** (in a new terminal):
```bash
cd camp-compass
npm install --legacy-peer-deps
```

Create `camp-compass/.env.local` with:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001
```
Replace `your_google_maps_api_key_here` with your actual Google Maps API key to enable live map rendering.

Then run:
```bash
npm run dev  # Start on http://localhost:3000
```

**Mobile Frontend Setup** (in a new terminal):
```bash
cd camp-compass-mobile
npm install --legacy-peer-deps
npm start  # Scan QR code with Expo Go or press 'i'/'a'/'w' for iOS/Android/Web
```

### Phase 3: Verify Installation

✅ **Backend Check**: Visit `http://localhost:3001/api/health` — should return status 200
✅ **Web Check**: Visit `http://localhost:3000` — should load the web app
✅ **Mobile Check**: Scan QR code or use emulator — mobile app should launch

### Common Issues & Solutions

**Issue**: `npm install` fails with peer dependency errors
- **Solution**: Use `npm install --legacy-peer-deps` for web and mobile projects

**Issue**: PostgreSQL connection error
- **Solution**: Verify DATABASE_URL in `.env.local`, ensure PostgreSQL service is running

**Issue**: Port 3000 or 3001 already in use
- **Solution**: Change PORT in `.env.local` or kill the process using that port

**Issue**: `prisma migrate` fails
- **Solution**: Ensure database exists and DATABASE_URL is correct, then run `npx prisma db push`

---

## 🔄 Development Workflow

### Day-to-Day Development

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev  # Runs on http://localhost:3001
   ```

2. **Start Web Frontend** (Terminal 2):
   ```bash
   cd camp-compass
   npm run dev  # Runs on http://localhost:3000
   ```

3. **Start Mobile Frontend** (Terminal 3):
   ```bash
   cd camp-compass-mobile
   npm start  # Scan QR or select platform
   ```

### Making Database Changes

When you modify `backend/prisma/schema.prisma`:
```bash
cd backend
npx prisma migrate dev --name "describe_your_change"
```

This creates a migration file and updates the database.

### Adding New API Endpoints

1. Create file in `backend/app/api/[feature]/route.ts`
2. Export functions: `export async function GET() {}` or `POST`, `PUT`, `DELETE`
3. Import and use Prisma client from `backend/lib/prisma.ts`
4. Apply RBAC with middleware from `backend/lib/rbac.ts`

Example:
```typescript
// backend/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req, ['ADMIN']);  // Require ADMIN role
  const data = await prisma.example.findMany();
  return NextResponse.json(data);
}
```

### Using API Client in Frontend

**Web (React)**:
```typescript
import { api } from '@/lib/api';

const response = await api.get('/auth/me');  // Automatically includes auth header
```

**Mobile (React Native)**:
```typescript
import { api } from '@/lib/api';

const response = await api.get('/auth/me');  // Same pattern
```

---

## � Project Structure

```
Camp-Compass/
├── backend/                          # Next.js Backend API Server
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   │   ├── login/           # POST /api/auth/login
│   │   │   │   ├── register/        # POST /api/auth/register
│   │   │   │   └── me/              # GET /api/auth/me (verify token)
│   │   │   ├── campuses/            # Campus management endpoints
│   │   │   ├── courses/             # Course management endpoints
│   │   │   ├── halls/               # Hall/classroom management endpoints
│   │   │   ├── timetable/           # Timetable generation and retrieval
│   │   │   ├── users/               # User management endpoints
│   │   │   └── health/              # Health check endpoint
│   │   └── page.tsx                 # Backend info page
│   ├── lib/
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── rbac.ts                  # Role-based access control middleware
│   │   └── session.ts               # Session and JWT token management
│   ├── middleware.ts                # Next.js middleware for auth checks
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema definition
│   │   └── migrations/              # Database migration files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example                 # Environment variables template
│
├── camp-compass/                    # React + Next.js Web Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx  # Global auth state management
│   │   │   ├── dashboard/           # Role-based dashboards
│   │   │   │   ├── admin/
│   │   │   │   ├── registrar/
│   │   │   │   ├── staff/
│   │   │   │   └── student/
│   │   │   └── components/
│   │   │       ├── ui/              # Reusable UI components
│   │   │       └── pages/           # Page-specific components
│   │   ├── lib/
│   │   │   ├── api.ts               # API client with auth handling
│   │   │   ├── authService.ts       # Authentication service methods
│   │   │   └── dataService.ts       # Data fetching service methods
│   │   └── styles/                  # Global styles and theme
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── camp-compass-mobile/             # React Native Expo Mobile App
│   ├── app/
│   │   ├── _layout.tsx              # Root layout with AuthProvider
│   │   ├── index.tsx                # Entry point (auth redirect)
│   │   ├── login.tsx                # Login screen
│   │   └── (app)/                   # Authenticated route group
│   │       ├── _layout.tsx
│   │       ├── admin/               # Admin role screens
│   │       ├── registrar/           # Registrar role screens
│   │       ├── staff/               # Staff role screens
│   │       └── student/             # Student role screens
│   ├── components/                  # Reusable mobile UI components
│   ├── context/                     # Context providers
│   │   └── AuthContext.tsx          # Mobile auth state
│   ├── screens/                     # Feature screens
│   ├── lib/
│   │   ├── api.ts                   # API client for mobile
│   │   ├── authService.ts           # Mobile-specific auth methods
│   │   └── dataService.ts           # Mobile data fetching
│   ├── package.json
│   ├── tsconfig.json
│   └── app.json                     # Expo configuration
│
├── BACKEND_SETUP_GUIDE.md          # Detailed backend setup instructions
├── PROJECT_STATUS.md               # Detailed project status and progress
├── IMPLEMENTATION_TRACKER.md       # Feature implementation matrix
└── README.md                        # This file
```

---

## 📝 Recent Changes (Blue Branch - May 2026)

### Summary of Phase 2 Implementation (20+ Commits)

The project has evolved significantly from Phase 1 infrastructure to Phase 2 with full feature implementation:

**Major Implementations Completed:**
- **Authentication Integration:** Login/register pages wired to backend with JWT + session management
- **Firebase Notifications:** Backend + mobile push notification system fully integrated
- **Admin Dashboard:** Timetable generation, availability resubmission review, broadcast messaging
- **Campus Mapping:** Google Maps integration with building CRUD, floor plans, floor navigation
- **Timetable System:** Constraint solver for conflict detection, role-filtered viewing with map deep-linking
- **Hall Management:** Search page with multi-criteria filtering, backend CRUD operations
- **Availability Management:** Weekly grid forms, mid-week updates, resubmission workflow
- **User Management:** Registration/profile pages, student/staff dashboard shells
- **Mobile Integration:** Timetable and campus map screens with backend data, deep-linking support
- **Database Seeding:** Test data for all roles with realistic scenarios
- **Proxy Middleware:** Role-based route access control across all API endpoints

### Key Backend Additions
- Auth endpoints: login, register, me (verify token)
- Campus/Building/Hall CRUD endpoints with geocoordinates
- Timetable generation with constraint solver
- Availability model + submission/review endpoints
- Notification system with Firebase integration
- Broadcast notifications persisted with a dedicated broadcast flag
- User profile endpoints with role-based access
- Multi-institutional data isolation

### Key Frontend Additions (Web - 12+ Pages)
- LoginPage (connected to backend)
- AdminDashboard (timetable generation, availability review, broadcasts)
- StudentDashboard, StaffDashboard, RegistrarDashboard shells
- TimetablePage (week/list views, filtering, map links)
- CampusMapPage (Google Maps, buildings, floors, halls)
- HallSearchPage (multi-criteria search)
- AvailabilityPage (weekly grid form)
- NotificationsPage (notification center)
- ProfilePage (user profile view/edit)
- ChangePasswordModal (password management)

### Key Mobile Additions
- TimetableScreen (timetable viewing with filtering)
- CampusMapScreen (building/floor/hall display)
- NotificationsScreen (notification center)
- Login screen integrated with backend
- AuthContext with AsyncStorage persistence

### Technology Upgrades
- Added Firebase Admin SDK for notifications
- Added React Hook Form for form management
- Added Sonner for toast notifications
- Added Recharts for data visualization
- Integrated Expo Firebase Cloud Messaging
- Implemented Prisma database seeding

### Database Enhancements
- Institution model for multi-tenancy
- Building model with floor support
- Availability model for lecturer scheduling
- Notification model for system alerts
- ResubmissionStatus enum for workflow
- User FCM tokens for push notifications

---

## 🤝 Contribution Guidelines

### Creating Feature Branches
```bash
git checkout -b feature/my-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### Commit Message Format
Follow conventional commits:
```bash
git commit -m "feat: add user profile page"
git commit -m "fix: correct authentication token expiry"
git commit -m "refactor: reorganize database schema"
```

### Before Pushing
1. Ensure all tests pass and code builds
2. Verify changes work on your platform (web/mobile)
3. Update relevant documentation if needed
4. Create a pull request with clear description

### Pull Request Process
1. Push your branch to GitHub
2. Create PR against `main` branch
3. Include description of changes and motivation
4. Request review from team lead
5. Address feedback and rebase if needed

---

## 📚 Additional Documentation

- **[BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)** — Detailed backend infrastructure setup
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** — Comprehensive project progress report
- **[IMPLEMENTATION_TRACKER.md](./IMPLEMENTATION_TRACKER.md)** — Quick reference for feature status

---

## 📞 Support & Questions

For questions or issues:
1. Check existing documentation files first
2. Review git commit history for context
3. Check issue tracker on GitHub
4. Contact project lead for blockers

---

## 📝 License

This project is proprietary and built specifically for internal university use. Please reach out to the project administrator before reusing the source code.
