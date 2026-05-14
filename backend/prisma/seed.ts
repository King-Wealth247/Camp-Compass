import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create institution first
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-1' },
    update: {},
    create: {
      id: 'inst-1',
      name: 'Test University',
    },
  });

  // Create campus
  const campus = await prisma.campus.upsert({
    where: { id: 'campus-1' },
    update: {},
    create: {
      id: 'campus-1',
      name: 'Main Campus',
      city: 'Capital City',
      region: 'Central',
      latitude: 40.7128,
      longitude: -74.006,
      institutionId: institution.id,
    },
  });

  // Create buildings
  const building = await prisma.building.upsert({
    where: { id: 'building-1' },
    update: {},
    create: {
      id: 'building-1',
      name: 'Computer Science Building',
      code: 'CSB',
      campusId: campus.id,
      floors: 4,
      latitude: 40.7128,
      longitude: -74.006,
    },
  });

  const buildingTwo = await prisma.building.upsert({
    where: { id: 'building-2' },
    update: {},
    create: {
      id: 'building-2',
      name: 'Engineering Block',
      code: 'ENG',
      campusId: campus.id,
      floors: 5,
      latitude: 40.7134,
      longitude: -74.0055,
    },
  });

  const buildingThree = await prisma.building.upsert({
    where: { id: 'building-3' },
    update: {},
    create: {
      id: 'building-3',
      name: 'Library Complex',
      code: 'LIB',
      campusId: campus.id,
      floors: 3,
      latitude: 40.7119,
      longitude: -74.0058,
    },
  });

  // Create halls
  await prisma.hall.upsert({
    where: { id: 'hall-1' },
    update: {},
    create: {
      id: 'hall-1',
      name: 'CS Lecture Hall A',
      capacity: 100,
      isAvailable: true,
      buildingId: building.id,
      floor: 1,
    },
  });

  await prisma.hall.upsert({
    where: { id: 'hall-2' },
    update: {},
    create: {
      id: 'hall-2',
      name: 'CS Lab 1',
      capacity: 30,
      isAvailable: true,
      buildingId: building.id,
      floor: 2,
    },
  });

  await prisma.hall.upsert({
    where: { id: 'hall-3' },
    update: {},
    create: {
      id: 'hall-3',
      name: 'Engineering Workshop',
      capacity: 60,
      isAvailable: true,
      buildingId: buildingTwo.id,
      floor: 1,
    },
  });

  await prisma.hall.upsert({
    where: { id: 'hall-4' },
    update: {},
    create: {
      id: 'hall-4',
      name: 'Engineering Lab B',
      capacity: 40,
      isAvailable: true,
      buildingId: buildingTwo.id,
      floor: 2,
    },
  });

  await prisma.hall.upsert({
    where: { id: 'hall-5' },
    update: {},
    create: {
      id: 'hall-5',
      name: 'Library Seminar Room',
      capacity: 80,
      isAvailable: true,
      buildingId: buildingThree.id,
      floor: 1,
    },
  });

  await prisma.hall.upsert({
    where: { id: 'hall-6' },
    update: {},
    create: {
      id: 'hall-6',
      name: 'Library Study Atrium',
      capacity: 120,
      isAvailable: true,
      buildingId: buildingThree.id,
      floor: 2,
    },
  });

  // Create courses
  await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      department: 'Computer Science',
      level: 'Year 1',
      instructor: 'Dr. John Smith',
    },
  });

  await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      code: 'CS201',
      title: 'Data Structures',
      department: 'Computer Science',
      level: 'Year 2',
      instructor: 'Dr. Jane Doe',
    },
  });

  // Hash passwords
  const studentPassword = await bcrypt.hash('student123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const registrarPassword = await bcrypt.hash('registrar123', 10);

  // Create users
  await prisma.user.upsert({
    where: { email: 'student@campus.edu' },
    update: {},
    create: {
      email: 'student@campus.edu',
      password: studentPassword,
      name: 'Jane Doe',
      role: 'student',
      department: 'Computer Science',
      level: 'Year 3',
      tuitionPaid: true,
      institutionId: institution.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff@campus.edu' },
    update: {},
    create: {
      email: 'staff@campus.edu',
      password: staffPassword,
      name: 'Dr. John Smith',
      role: 'staff',
      department: 'Engineering',
      institutionId: institution.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      email: 'admin@campus.edu',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      institutionId: institution.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'registrar@campus.edu' },
    update: {},
    create: {
      email: 'registrar@campus.edu',
      password: registrarPassword,
      name: 'Registrar Office',
      role: 'registrar',
      institutionId: institution.id,
    },
  });

  // Create timetable entries
  await prisma.timetable.upsert({
    where: { id: 'timetable-1' },
    update: {},
    create: {
      campusId: campus.id,
      courseId: 'course-1',
      hallId: 'hall-1',
      startTime: new Date('2026-05-13T09:00:00Z'),
      endTime: new Date('2026-05-13T11:00:00Z'),
      day: 'Monday',
    },
  });

  await prisma.timetable.upsert({
    where: { id: 'timetable-2' },
    update: {},
    create: {
      campusId: campus.id,
      courseId: 'course-2',
      hallId: 'hall-2',
      startTime: new Date('2026-05-13T14:00:00Z'),
      endTime: new Date('2026-05-13T16:00:00Z'),
      day: 'Tuesday',
    },
  });

  // Seed availability records for staff
  // Dr. John Smith — weekend submission, available Mon/Tue/Thu mornings
  const staffUser = await prisma.user.findUnique({ where: { email: 'staff@campus.edu' } });
  if (staffUser) {
    await prisma.availability.upsert({
      where: { id: 'avail-1' },
      update: {},
      create: {
        id: 'avail-1',
        lecturerId: staffUser.id,
        monday: true,
        mondayTime: '08:00-12:00',
        tuesday: true,
        tuesdayTime: '08:00-17:00',
        wednesday: false,
        wednesdayTime: null,
        thursday: true,
        thursdayTime: '13:00-17:00',
        friday: false,
        fridayTime: null,
        saturday: false,
        saturdayTime: null,
        resubmission: null,
        description: null,
        submissionDate: new Date('2026-05-10T18:00:00Z'), // Saturday submission
      },
    });

    // Mid-week resubmission — Dr. John Smith changed Thursday availability
    await prisma.availability.upsert({
      where: { id: 'avail-2' },
      update: {},
      create: {
        id: 'avail-2',
        lecturerId: staffUser.id,
        monday: true,
        mondayTime: '08:00-12:00',
        tuesday: true,
        tuesdayTime: '08:00-17:00',
        wednesday: false,
        wednesdayTime: null,
        thursday: false,
        thursdayTime: null,
        friday: true,
        fridayTime: '13:00-17:00',
        saturday: false,
        saturdayTime: null,
        resubmission: 'unseen',
        description: 'Medical appointment on Thursday. Moved availability to Friday afternoon instead.',
        submissionDate: new Date('2026-05-13T10:00:00Z'), // Tuesday resubmission
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });