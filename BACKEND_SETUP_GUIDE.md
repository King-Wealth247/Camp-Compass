# Camp-Compass Backend Setup Guide

**Target:** Set up a backend service using Next.js App Router, Prisma, and PostgreSQL.

This guide replaces the previous Python/FastAPI plan. The backend is implemented inside `backend/` as a Next.js project with API routes and Prisma ORM for database access.

---

## 1. Overview

The backend will use:
- Next.js App Router (`backend/app/`)
- Prisma for ORM and database migrations
- PostgreSQL for production data storage
- JWT and bcrypt for authentication
- API route handlers under `backend/app/api/`

The frontend applications (`camp-compass/` and `camp-compass-mobile/`) will consume this backend through REST API requests.

---

## 2. Prerequisites

- Node.js 20+ installed
- PostgreSQL 14+ installed and running
- `npm` or `pnpm` available
- `backend/` folder exists in the repo

---

## 3. Backend Folder Setup

From the project root:

```bash
cd backend
npm init -y
```

Install the required packages:

```bash
npm install next react react-dom bcryptjs jsonwebtoken
npm install prisma @prisma/client
npm install --save-dev typescript @types/node @types/react @types/react-dom @types/bcryptjs @types/jsonwebtoken eslint eslint-config-next
```

If you already have `backend/package.json`, verify it includes these dependencies.

---

## 4. Configure TypeScript and Next.js

Create or update `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

Create or verify `backend/next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

Make sure `backend/next-env.d.ts` exists with the default Next.js content.

---

## 5. Initialize Prisma

Run:

```bash
npx prisma init --datasource-provider postgresql
```

This creates:
- `backend/prisma/schema.prisma`
- `backend/.env`

Update `backend/.env` with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/camp_compass?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN=1h
NEXTAUTH_URL="http://localhost:3001"
```

---

## 6. Define Prisma Schema

Replace `backend/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  student
  staff
  admin
  registrar
}

model Institution {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  users     User[]
  campuses  Campus[]
}

model Campus {
  id          String    @id @default(cuid())
  name        String
  institution Institution @relation(fields: [institutionId], references: [id])
  institutionId String
  buildings   Building[]
  createdAt   DateTime  @default(now())
}

model Building {
  id        String   @id @default(cuid())
  name      String
  campus    Campus   @relation(fields: [campusId], references: [id])
  campusId  String
  halls     Hall[]
  createdAt DateTime @default(now())
}

model Hall {
  id          String    @id @default(cuid())
  name        String
  capacity    Int
  building    Building  @relation(fields: [buildingId], references: [id])
  buildingId  String
  isAvailable Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

model Course {
  id           String    @id @default(cuid())
  code         String    @unique
  title        String
  department   String
  level        String
  instructor   String
  createdAt    DateTime  @default(now())
}

model Timetable {
  id           String    @id @default(cuid())
  campus       Campus    @relation(fields: [campusId], references: [id])
  campusId     String
  course       Course    @relation(fields: [courseId], references: [id])
  courseId     String
  hall         Hall      @relation(fields: [hallId], references: [id])
  hallId       String
  startTime    DateTime
  endTime      DateTime
  day          String
  createdAt    DateTime  @default(now())
}

model User {
  id             String      @id @default(cuid())
  email          String      @unique
  password       String
  name           String
  role           UserRole    @default(student)
  department     String?
  level          String?
  tuitionPaid    Boolean     @default(false)
  institution    Institution @relation(fields: [institutionId], references: [id])
  institutionId  String
  createdAt      DateTime    @default(now())
}
```

Then generate the Prisma client:

```bash
npx prisma generate
```

---

## 7. Run Prisma Migrations

Create the first migration:

```bash
npx prisma migrate dev --name init
```

This will create the database schema and keep your Prisma client in sync.

Use Prisma Studio to inspect the database:

```bash
npx prisma studio
```

---

## 8. Create Prisma Client Helper

Create `backend/lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 9. Create Auth Utilities

Create `backend/lib/auth.ts`:

```ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as { sub: string; role: string };
}
```

---

## 10. Create API Routes

Use Next.js route handlers in `backend/app/api/`.

### 10.1 Auth Register Route

Create `backend/app/api/auth/register/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name, role, institutionId } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      institutionId,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
```

### 10.2 Auth Login Route

Create `backend/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ sub: user.id, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
```

### 10.3 Auth Me Route

Create `backend/app/api/auth/me/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

---

## 11. Create Basic Data Routes

These routes should use the Prisma client and provide read/write capabilities for the app.

Example `backend/app/api/halls/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const halls = await prisma.hall.findMany({ include: { building: true } });
  return NextResponse.json(halls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hall = await prisma.hall.create({
    data: {
      name: body.name,
      capacity: body.capacity,
      buildingId: body.buildingId,
    },
  });
  return NextResponse.json(hall);
}
```

Add similar route handlers for `courses`, `timetables`, `campuses`, and `users`.

---

## 12. Configure Path Aliases

Update `backend/tsconfig.json` and optionally `backend/tsconfig.paths.json` for `@/` imports.

Example `backend/tsconfig.json` additions:

```json
  "baseUrl": ".",
  "paths": {
    "@/*": ["./*"]
  }
```

If your editor needs a separate paths file, add it accordingly.

---

## 13. Run the Backend

Start the backend service from `backend/`:

```bash
npm run dev
```

By default, Next.js will listen on `http://localhost:3001` if you set the port in scripts or environment.

---

## 14. Connect Frontend and Mobile Apps

- Web app: call `http://localhost:3001/api/auth/login` and other API routes from `camp-compass/`.
- Mobile app: call the same backend base URL from `camp-compass-mobile/`.

Make sure both apps use the JWT token returned by login for authenticated requests.

---

## 15. Notes

- This guide assumes the backend is a standalone Next.js project inside `backend/`.
- Prisma is the primary ORM and PostgreSQL is the production database.
- No Python, FastAPI, SQLite, or Flask code should be used for this backend.
- If you want to keep `backend/` as a separate service, the same Prisma schema and route design can be reused.

---

## 16. Useful Prisma Commands

```bash
npx prisma migrate dev --name init
npx prisma db pull
npx prisma db push
npx prisma studio
npx prisma generate
```

---

## 17. Troubleshooting

- If `npx prisma migrate dev` fails, verify `DATABASE_URL` and PostgreSQL credentials.
- If import alias `@/` fails, restart your editor and ensure `tsconfig.json` path mapping is correct.
- If JWT token validation fails, verify `JWT_SECRET` is set and caught by `process.env`.
- Use `npx prisma studio` to inspect tables and seeded data.
