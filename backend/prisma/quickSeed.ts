/**
 * Quick seed script — runs against Neon DB via DATABASE_URL_UNPOOLED
 * Run with: npx tsx prisma/quickSeed.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use the unpooled URL for direct connections from scripts
process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Neon database…');
  const hash = bcrypt.hashSync('password123', 10);

  // ── Institution ──────────────────────────────────────────────────────────
  let institution = await prisma.institution.findFirst({ where: { name: 'Camp Compass University' } });
  if (!institution) {
    institution = await prisma.institution.create({ data: { name: 'Camp Compass University' } });
  }
  console.log('✅ Institution:', institution.name);

  // ── Campus ───────────────────────────────────────────────────────────────
  let campus = await prisma.campus.findFirst({ where: { name: 'Main Campus', institutionId: institution.id } });
  if (!campus) {
    campus = await prisma.campus.create({
      data: {
        name: 'Main Campus', city: 'Accra', region: 'Greater Accra',
        latitude: 5.6037, longitude: -0.1870, institutionId: institution.id,
      },
    });
  }
  console.log('✅ Campus:', campus.name);

  // ── Building ─────────────────────────────────────────────────────────────
  let building = await prisma.building.findFirst({ where: { name: 'Science Block', campusId: campus.id } });
  if (!building) {
    building = await prisma.building.create({ data: { name: 'Science Block', campusId: campus.id, floors: 4 } });
  }

  // ── Halls ────────────────────────────────────────────────────────────────
  const hallData = [
    { name: 'Hall A', capacity: 120, floor: 1 },
    { name: 'Hall B', capacity: 80, floor: 1 },
    { name: 'Hall C', capacity: 200, floor: 2 },
    { name: 'Hall D', capacity: 60, floor: 2 },
    { name: 'Hall E', capacity: 150, floor: 3 },
    { name: 'Free Hall', capacity: 100, floor: 3 },
  ];
  for (const h of hallData) {
    const existing = await prisma.hall.findFirst({ where: { name: h.name, buildingId: building.id } });
    if (!existing) {
      await prisma.hall.create({ data: { ...h, isAvailable: true, buildingId: building.id } });
    }
  }
  console.log('✅ 6 Halls created');

  // ── Departments ──────────────────────────────────────────────────────────
  const depts = ['Computer Science', 'Engineering', 'Business Administration', 'Mathematics'];
  const deptRecords: Record<string, any> = {};
  for (const d of depts) {
    let rec = await prisma.department.findFirst({ where: { departmentName: d, institutionId: institution.id } });
    if (!rec) rec = await prisma.department.create({ data: { departmentName: d, institutionId: institution.id } });
    deptRecords[d] = rec;
  }
  console.log('✅ 4 Departments created');

  // ── Admin user ───────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campcompass.edu' },
    update: {},
    create: {
      name: 'System Admin', email: 'admin@campcompass.edu',
      password: hash, role: 'admin',
      institutionId: institution.id,
    },
  });
  console.log('✅ Admin:', admin.email);

  // ── Staff users ──────────────────────────────────────────────────────────
  const staffNames = [
    { name: 'Dr. Sarah Mensah', dept: 'Computer Science' },
    { name: 'Prof. Kwame Asante', dept: 'Engineering' },
    { name: 'Dr. Ama Boateng', dept: 'Mathematics' },
  ];
  const staffRecords = [];
  for (const s of staffNames) {
    const email = s.name.toLowerCase().replace(/[^a-z]/g, '.') + '@campcompass.edu';
    const staff = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: s.name, email, password: hash, role: 'staff',
        institutionId: institution.id,
        departmentId: deptRecords[s.dept]?.id,
      },
    });
    staffRecords.push(staff);
  }
  console.log('✅ 3 Staff users created');

  // ── Student users ────────────────────────────────────────────────────────
  const studentNames = ['Kofi Acheampong', 'Abena Darko', 'Yaw Owusu', 'Akua Boateng'];
  for (let i = 0; i < studentNames.length; i++) {
    const email = studentNames[i].toLowerCase().replace(/ /g, '.') + '@student.campcompass.edu';
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: studentNames[i], email, password: hash, role: 'student',
        institutionId: institution.id,
        departmentId: deptRecords['Computer Science']?.id,
        tuitionPaid: i % 2 === 0,
        level: 200,
      },
    });
  }
  console.log('✅ 4 Student users created');

  // ── Registrar ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'registrar@campcompass.edu' },
    update: {},
    create: {
      name: 'Mrs. Grace Asante', email: 'registrar@campcompass.edu',
      password: hash, role: 'registrar', institutionId: institution.id,
    },
  });
  console.log('✅ Registrar created');

  // ── Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      { userId: admin.id, title: '🎉 Welcome to Camp-Compass!', message: 'Your system is live and connected to Neon DB. Start generating timetables.', type: 'success', broadcast: true },
      { userId: admin.id, title: '📅 Timetables Ready', message: 'Generate the first batch timetable from Admin Dashboard → Timetable Generation.', type: 'info', broadcast: false },
    ],
  });
  console.log('✅ Notifications created');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Test Accounts (password: password123)');
  console.log('   Admin:      admin@campcompass.edu');
  console.log('   Staff:      dr.sarah.mensah@campcompass.edu');
  console.log('   Student:    kofi.acheampong@student.campcompass.edu');
  console.log('   Registrar:  registrar@campcompass.edu');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
