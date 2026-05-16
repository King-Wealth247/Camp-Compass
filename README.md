# Camp-Compass 🎓📱

**Camp-Compass** is a comprehensive, multi-platform campus management system for university administration. It provides role-based interactive dashboards for **Students**, **Staff**, **Admins**, and **Registrars** to manage timetables, interactive campus maps, classroom availability, user profiles, and real-time notifications.

**Project Status:** Phase 3 Complete - Core Features & Enhancements Implemented (v0.2.0)
**Last Updated:** May 16, 2026

---

## 🎯 Overview

Camp-Compass is a fully-functional full-stack application consisting of:
- **Backend:** Next.js REST API with PostgreSQL, Prisma ORM, JWT authentication, SMTP Mailer, and Firebase notifications
- **Web Frontend:** React + Next.js with Tailwind CSS for desktop/tablet users with extensive role-based dashboards
- **Mobile Frontend:** React Native (Expo) with seamless cross-platform syncing for iOS and Android users

All platforms share:
- Common JWT-based authentication with role-based access control
- Secure profile management and automated credential delivery (via Nodemailer)
- Real-time Firebase notification integration
- Integrated timetable viewing with campus map deep-linking and floor plan previews
- Multi-institutional support with granular user management

---

## 🚀 Key Features

- **Role-based Authentication:** Secure portal access with tailored views for Student, Staff, Admin, or Registrar roles.
- **Automated Credentialing:** Automatic generation of institutional emails and passwords, instantly mailed to the user's personal recovery email via SMTP.
- **Smart Timetables:** Segmented timetable subcomponents ensuring specific scheduling arrays per department, instructor, and level.
- **Interactive Campus Maps & Floor Plans:** Navigate indoor and outdoor spaces, view building floor plans (rendered directly from binary database storage), and locate lecture halls.
- **Classroom Availability:** Real-time availability matrix for staff to declare availability, handled by an advanced constraint detection system.
- **Infrastructure Management:** Dynamic Admin UI handling the creation, modification, and deletion of Campuses, Buildings, Floors, and Halls.
- **Real-time Notifications:** In-app alert system for timetable changes, system updates, and urgent messages.
- **Dedicated User Profiles:** Interfaces for users to view their academic metadata, edit personal contact numbers, and track institutional emails.
- **Multi-Platform Support:** Works seamlessly on web browsers, iOS, and Android devices.

---

## 🛠️ Tech Stack

### Backend (`/backend`)
- **[Next.js 16](https://nextjs.org/)** — Full-stack JavaScript framework with API routes
- **[Prisma 5.5](https://www.prisma.io/)** — Modern ORM for database access and migrations
- **[PostgreSQL 14+](https://www.postgresql.org/)** — Production database (Stores BYTEA formats for floor plans)
- **[Nodemailer](https://nodemailer.com/)** — SMTP module for automated system emails
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

## 💻 Pulling, Installing, and Testing the Application

### Phase 1: Prerequisites

#### System Requirements
- **Node.js** v18 or higher (verify with `node --version`)
- **npm** v8+ (comes with Node.js)
- **Git** for version control
- **PostgreSQL 14+** running locally or remotely

#### Optional (for mobile development)
- **Expo Go** app on iOS/Android (for testing mobile without emulator)
- **Android Studio** / **Xcode** (for emulators)

### Phase 2: Pulling the Repository

```bash
git clone https://github.com/King-Wealth247/Camp-Compass.git
cd Camp-Compass
git pull origin main
```

### Phase 3: Backend Setup & Installation

1. **Create a local database**:
   ```bash
   psql -U postgres
   CREATE DATABASE camp_compass_dev;
   \q
   ```

2. **Configure Environment Variables**:
   Navigate to the backend folder and create your `.env.local` file:
   ```bash
   cd backend
   touch .env.local
   ```
   Add the following environment variables:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/camp_compass_dev"

   # JWT Secret Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Environment
   NODE_ENV=development
   PORT=3001

   # Mailer SMTP Configuration (For Registration Emails)
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```
   *Note: If `SMTP_PASS` is empty, the server will safely fallback to logging the email payload to the console.*

3. **Install Dependencies & Seed Database**:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx tsx prisma/seed.ts  # Critical: Seeds the initial infrastructure, timetables, and admin accounts
   ```

4. **Start the Backend Server**:
   ```bash
   npm run dev  # Starts backend on http://localhost:3001
   ```

### Phase 4: Web Frontend Setup & Installation

1. Open a new terminal and navigate to the web directory:
   ```bash
   cd camp-compass
   ```

2. Configure Web Environment Variables:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   # NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001
   ```

3. **Install Dependencies & Run**:
   ```bash
   npm install --legacy-peer-deps
   npm run dev  # Starts web app on http://localhost:3000
   ```

### Phase 5: Mobile Frontend Setup & Installation

1. Open a new terminal and navigate to the mobile directory:
   ```bash
   cd camp-compass-mobile
   ```

2. **Install Dependencies & Run**:
   ```bash
   npm install --legacy-peer-deps
   npm start  # Launches Expo Metro Bundler
   ```
   *Scan the QR code using Expo Go on your mobile device, or press 'i'/'a' to run on an emulator.*

### Phase 6: System Verification & Testing

Once all three servers are running, follow these steps to verify system integrity:

1. **Verify Backend Health**: Visit `http://localhost:3001/api/health` — it should return a 200 OK status.
2. **Test Admin Infrastructure**: 
   - Login to the Web App (`http://localhost:3000`) using the seeded Admin credentials (from `seed.ts`).
   - Navigate to "Infrastructure Management" to ensure Campuses, Buildings, Floors (with images), and Halls are loading correctly.
3. **Test Registrar Email Integration**:
   - Login as the Registrar and navigate to the registration form.
   - Register a dummy student/staff member and verify that their credentials are computationally generated and dispatched to the provided `regEmail`.
4. **Test Timetable and Maps**:
   - Login as a Student or Staff member on the mobile or web app.
   - Click on the "Timetable" navigation tab. Click on a scheduled module and ensure it successfully routes to the Interactive Campus map, triggering the base64 conversion of the floor plan.

---

## 📝 Recent Changes & Updates

### Architecture & Database Evolution
- Completely decoupled and restructured the `Timetable` and `TimetableSubComponent` schema to support granular schedule indexing for students, lecturers, halls, and specific days/times.
- Enhanced the `Floor` and `Building` architectures to support binary `BYTEA` storage, enabling admins to natively upload floor plan blueprints into the PostgreSQL database.
- Integrated `regEmail` properties into the `User` schema for automated external account credentialing.

### Frontend Re-engineering
- **Admin UI Restructure:** Segmented the admin dashboard into dedicated spaces: Infrastructure Management (Campuses, Buildings, Halls, Floors), User Directory filters, Timetable Management, and Notification Broadcasters.
- **Dynamic Floor Plan Rendering:** Camp-Compass now extracts `BYTEA` floor plans via the `/api/floors/[id]` endpoint, converting it client-side into `base64` objects natively overlaying Google Maps views on both Web and React Native.
- **Staff Availability Submission:** The weekly availability form now saves directly into the database schema via `/api/availability`, integrating seamlessly into the constraint solver.
- **Profile Hubs:** Constructed dynamic profile settings for all user roles, allowing live credential updates.

### Backend Infrastructure
- Installed and configured `nodemailer` globally. 
- Altered Auth-Registration middlewares to enforce `regEmail` logic, generating algorithmic passwords and utilizing SMTP logic for onboarding.
- Handled advanced TypeScript interface mappings (`AuthContext`, `DataService`) ensuring identical API typing between Web and Mobile clients.
- Cleaned up build errors, specifically surrounding unescaped characters, component rendering arrays, and undefined interface configurations.

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
1. Ensure all tests pass and code builds (`npx tsc --noEmit`)
2. Verify changes work on your platform (web/mobile)
3. Create a pull request with clear description

---

## 📝 License

This project is proprietary and built specifically for internal university use. Please reach out to the project administrator before reusing the source code.
