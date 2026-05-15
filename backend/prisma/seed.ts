import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Create 2 institutions
  const institutions = [];
  for (let i = 1; i <= 2; i++) {
    const institution = await prisma.institution.upsert({
      where: { id: `inst-${i}` },
      update: {},
      create: {
        id: `inst-${i}`,
        name: `Institution ${i}`,
      },
    });
    institutions.push(institution);
  }

  await prisma.user.upsert({
    where: { email: 'registrar@test.com' },
    update: {
      role: 'registrar',
      institutionId: institutions[0].id,
    },
    create: {
      id: 'seed-registrar',
      email: 'registrar@test.com',
      password: hashedPassword,
      name: 'Seed Registrar',
      role: 'registrar',
      department: 'Registrar Office',
      institutionId: institutions[0].id,
    },
  });

  // Create 5 campuses: 3 for inst-1, 2 for inst-2
  const campuses = [];
  for (let i = 1; i <= 5; i++) {
    const institutionId = i <= 3 ? institutions[0].id : institutions[1].id;
    const campus = await prisma.campus.upsert({
      where: { id: `campus-${i}` },
      update: {},
      create: {
        id: `campus-${i}`,
        name: `Campus ${i}`,
        city: `City ${i}`,
        region: `Region ${Math.floor((i-1)/2) + 1}`,
        latitude: 40.7128 + Math.random() * 0.1,
        longitude: -74.006 + Math.random() * 0.1,
        institutionId,
      },
    });
    campuses.push(campus);
  }

  // Create 20 buildings, distributed across campuses
  const buildings = [];
  for (let i = 1; i <= 20; i++) {
    const campusId = campuses[(i-1) % campuses.length].id;
    const building = await prisma.building.upsert({
      where: { id: `building-${i}` },
      update: {},
      create: {
        id: `building-${i}`,
        name: `Building ${i}`,
        code: `B${i}`,
        campusId,
        floors: Math.floor(Math.random() * 5) + 1,
        latitude: 40.7128 + Math.random() * 0.1,
        longitude: -74.006 + Math.random() * 0.1,
      },
    });
    buildings.push(building);
  }

  // Create at least 50 halls
  const halls = [];
  for (let i = 1; i <= 50; i++) {
    const buildingId = buildings[(i-1) % buildings.length].id;
    const hall = await prisma.hall.upsert({
      where: { id: `hall-${i}` },
      update: {},
      create: {
        id: `hall-${i}`,
        name: `Hall ${i}`,
        capacity: Math.floor(Math.random() * 200) + 20,
        floor: Math.floor(Math.random() * 5) + 1,
        buildingId,
        isAvailable: Math.random() > 0.5,
      },
    });
    halls.push(hall);
  }

  // Create at least 50 courses
  const courses = [];
  const departments = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry'];
  const levels = ['100', '200', '300', '400'];
  for (let i = 1; i <= 50; i++) {
    const course = await prisma.course.upsert({
      where: { id: `course-${i}` },
      update: {},
      create: {
        id: `course-${i}`,
        code: `CS${i}`,
        title: `Course ${i}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        instructor: `Instructor ${i}`,
      },
    });
    courses.push(course);
  }

  // Create at least 50 users
  const users = [];
  const roles: ('student' | 'staff' | 'admin' | 'registrar')[] = ['student', 'staff', 'admin', 'registrar'];
  for (let i = 1; i <= 50; i++) {
    const institutionId = institutions[Math.floor(Math.random() * institutions.length)].id;
    const user = await prisma.user.upsert({
      where: { id: `user-${i}` },
      update: {},
      create: {
        id: `user-${i}`,
        email: `user${i}@test.com`,
        password: hashedPassword,
        name: `User ${i}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        tuitionPaid: Math.random() > 0.5,
        institutionId,
      },
    });
    users.push(user);
  }

  // Create at least 50 timetables
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  for (let i = 1; i <= 50; i++) {
    const campusId = campuses[Math.floor(Math.random() * campuses.length)].id;
    const courseId = courses[Math.floor(Math.random() * courses.length)].id;
    const hallId = halls[Math.floor(Math.random() * halls.length)].id;
    const startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
    const startTime = new Date();
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startHour + 1);
    const day = days[Math.floor(Math.random() * days.length)];
    await prisma.timetable.upsert({
      where: { id: `timetable-${i}` },
      update: {},
      create: {
        id: `timetable-${i}`,
        campusId,
        courseId,
        hallId,
        startTime,
        endTime,
        day,
      },
    });
  }

  // Create at least 50 availabilities (for staff users)
  const staffUsers = users.filter(u => u.role === 'staff');
  for (let i = 1; i <= 50; i++) {
    const lecturerId = staffUsers[Math.floor(Math.random() * staffUsers.length)].id;
    await prisma.availability.upsert({
      where: { id: `availability-${i}` },
      update: {},
      create: {
        id: `availability-${i}`,
        lecturerId,
        monday: Math.random() > 0.5,
        mondayTime: Math.random() > 0.5 ? '09:00-11:00' : null,
        tuesday: Math.random() > 0.5,
        tuesdayTime: Math.random() > 0.5 ? '10:00-12:00' : null,
        wednesday: Math.random() > 0.5,
        wednesdayTime: Math.random() > 0.5 ? '14:00-16:00' : null,
        thursday: Math.random() > 0.5,
        thursdayTime: Math.random() > 0.5 ? '13:00-15:00' : null,
        friday: Math.random() > 0.5,
        fridayTime: Math.random() > 0.5 ? '11:00-13:00' : null,
        saturday: Math.random() > 0.5,
        saturdayTime: Math.random() > 0.5 ? '08:00-10:00' : null,
        resubmission: 'unseen',
        description: `Availability ${i}`,
      },
    });
  }

  // Create at least 50 notifications
  const types = ['info', 'warning', 'error'];
  for (let i = 1; i <= 50; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    await prisma.notification.upsert({
      where: { id: `notification-${i}` },
      update: {},
      create: {
        id: `notification-${i}`,
        userId,
        title: `Notification ${i}`,
        message: `This is notification message ${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        read: Math.random() > 0.5,
      },
    });
  }

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });