import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  // 1. Create Institutions
  const institutionNames = ['University of Technology', 'Global Business School'];
  const institutions = [];
  for (const name of institutionNames) {
    const institution = await prisma.institution.create({
      data: { name },
    });
    institutions.push(institution);
  }

  // 2. Create Campuses
  const campusNames = ['Main Campus', 'Downtown Campus', 'North Campus'];
  const campuses = [];
  for (const inst of institutions) {
    for (const cName of campusNames) {
      const campus = await prisma.campus.create({
        data: {
          name: cName,
          city: 'Metropolis',
          region: 'State',
          latitude: 40.7128,
          longitude: -74.0060,
          institutionId: inst.id,
        },
      });
      campuses.push(campus);
    }
  }

  // 3. Create Departments
  const deptNames = ['Computer Science', 'Mechanical Engineering', 'Business Administration', 'Mathematics'];
  const departments = [];
  for (const inst of institutions) {
    const mainCampus = campuses.find(c => c.institutionId === inst.id);
    for (const deptName of deptNames) {
      const dept = await prisma.department.create({
        data: {
          institutionId: inst.id,
          departmentName: deptName,
          mainCampusId: mainCampus?.id,
        },
      });
      departments.push(dept);
    }
  }

  // 4. Create Levels
  const levels = [];
  for (const dept of departments) {
    for (let i = 1; i <= 4; i++) {
      const level = await prisma.level.create({
        data: {
          departmentId: dept.id,
          level: i,
        },
      });
      levels.push(level);
    }
  }

  // 5. Create Buildings & Floors & Halls
  const buildingNames = ['Engineering Block', 'Science Tower', 'Business Hub', 'Liberal Arts Center'];
  const hallsList = [];
  for (const campus of campuses) {
    for (const bName of buildingNames) {
      const building = await prisma.building.create({
        data: {
          name: bName,
          code: bName.substring(0, 3).toUpperCase(),
          campusId: campus.id,
          floors: 3,
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });

      for (let floorNum = 1; floorNum <= building.floors; floorNum++) {
        const floor = await prisma.floor.create({
          data: {
            buildingId: building.id,
            floorNum: floorNum,
          },
        });

        // Add halls for each floor
        for (let hallNum = 1; hallNum <= 3; hallNum++) {
          const hall = await prisma.hall.create({
            data: {
              name: `Room ${floorNum}0${hallNum}`,
              capacity: 50,
              floorId: floor.id,
              floor: floorNum,
              buildingId: building.id,
              isAvailable: true,
            },
          });
          hallsList.push(hall);
        }
      }
    }
  }

  // 6. Create Users
  const users = [];

  // Registrar
  users.push(await prisma.user.create({
    data: {
      email: 'registrar@test.com',
      password: hashedPassword,
      name: 'Robert Collins',
      role: 'registrar',
      institutionId: institutions[0].id,
      regEmail: 'personal.robert@gmail.com',
    },
  }));

  // Admins
  const adminNames = ['Alice Johnson', 'Michael Brown'];
  for (const name of adminNames) {
    users.push(await prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(' ', '.')}@test.com`,
        password: hashedPassword,
        name: name,
        role: 'admin',
        institutionId: institutions[0].id,
      },
    }));
  }

  // Staff (Instructors)
  const staffNames = ['Dr. Sarah Williams', 'Prof. David Miller', 'Dr. Emily Davis', 'Prof. James Wilson', 'Dr. Emma Taylor'];
  const staffUsers = [];
  for (const name of staffNames) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const staff = await prisma.user.create({
      data: {
        email: `${name.split(' ')[1].toLowerCase()}@test.com`,
        password: hashedPassword,
        name: name,
        role: 'staff',
        departmentId: dept.id,
        department: dept.departmentName,
        institutionId: dept.institutionId,
      },
    });
    users.push(staff);
    staffUsers.push(staff);
  }

  // Students
  const studentNames = ['Olivia Martinez', 'Liam Anderson', 'Sophia Thomas', 'Jackson Jackson', 'Ava White', 'Lucas Harris', 'Mia Martin', 'Ethan Thompson', 'Isabella Garcia', 'Mason Martinez'];
  for (const name of studentNames) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const deptLevels = levels.filter(l => l.departmentId === dept.id);
    const level = deptLevels[Math.floor(Math.random() * deptLevels.length)];

    users.push(await prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(' ', '.')}@student.com`,
        password: hashedPassword,
        name: name,
        role: 'student',
        departmentId: dept.id,
        department: dept.departmentName,
        levelId: level.id,
        level: level.level,
        tuitionPaid: true,
        institutionId: dept.institutionId,
        regEmail: `personal.${name.split(' ')[0].toLowerCase()}@gmail.com`,
      },
    }));
  }

  // 7. Create Courses
  const courseTitles = ['Introduction to Programming', 'Calculus I', 'Business Ethics', 'Physics Mechanics', 'Data Structures'];
  const courses = [];
  for (let i = 0; i < 20; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const deptLevels = levels.filter(l => l.departmentId === dept.id);
    const level = deptLevels[Math.floor(Math.random() * deptLevels.length)];
    const instructor = staffUsers[Math.floor(Math.random() * staffUsers.length)];
    const title = courseTitles[Math.floor(Math.random() * courseTitles.length)];

    const course = await prisma.course.create({
      data: {
        code: `${dept.departmentName.substring(0, 3).toUpperCase()}${100 + i}`,
        title: `${title} ${i+1}`,
        departmentId: dept.id,
        department: dept.departmentName,
        levelId: level.id,
        level: level.level,
        instructorId: instructor.id,
        instructor: instructor.name,
      },
    });
    courses.push(course);
  }

  // 8. Create Timetables
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00-09:50', '10:10-12:00', '13:00-15:50', '16:10-17:00'];
  
  // Create 2 Timetables for specific departments and levels
  const targetDepts = [departments[0], departments[1]];

  for (let tIndex = 0; tIndex < targetDepts.length; tIndex++) {
    const targetDept = targetDepts[tIndex];
    const targetLevel = levels.find(l => l.departmentId === targetDept.id);
    
    if (targetLevel) {
      const timetable = await prisma.timetable.create({
        data: {
          departmentId: targetDept.id,
          levelId: targetLevel.id,
          level: targetLevel.level,
        },
      });

      const levelCourses = courses.filter(c => c.levelId === targetLevel.id);
      const subComponentCourses = levelCourses.slice(0, 3); // Take up to 3 courses per timetable (total 6 for 2 timetables)

      for (let i = 0; i < subComponentCourses.length; i++) {
        const course = subComponentCourses[i];
        const hall = hallsList[i % hallsList.length];
        const day = days[i % days.length];
        const slot = timeSlots[i % timeSlots.length];
        const [start, end] = slot.split('-');

        const startTime = new Date();
        startTime.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1]), 0, 0);
        
        const endTime = new Date();
        endTime.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1]), 0, 0);

        await prisma.timetableSubComponent.create({
          data: {
            courseId: course.id,
            course: course.title,
            instructor: course.instructor,
            hallId: hall.id,
            hall: hall.name,
            floor: hall.floor,
            startTime,
            endTime,
            day,
            timetableId: timetable.id,
          },
        });
      }
    }
  }

  // 9. Create Availabilities
  for (const staff of staffUsers) {
    await prisma.availability.create({
      data: {
        lecturerId: staff.id,
        monday: true,
        mondayTime: '08:00-09:50',
        tuesday: true,
        tuesdayTime: '10:10-12:00',
        wednesday: true,
        wednesdayTime: '13:00-15:50',
        thursday: true,
        thursdayTime: '16:10-17:00',
        friday: true,
        fridayTime: '08:00-09:50',
        saturday: false,
        saturdayTime: null,
        resubmission: 'unseen',
        description: 'Standard availability matching timetable slots',
      },
    });
  }

  console.log('Database seeded successfully with English names and new schema.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });