/*
  Warnings:

  - You are about to drop the column `campusId` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `hallId` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Timetable` table. All the data in the column will be lost.
  - You are about to drop the column `courseTaught` on the `User` table. All the data in the column will be lost.
  - The `level` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `departmentId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructorId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `level` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `departmentId` to the `Timetable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Timetable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `levelId` to the `Timetable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_campusId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Timetable" DROP CONSTRAINT "Timetable_hallId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "instructorId" TEXT NOT NULL,
ADD COLUMN     "levelId" TEXT NOT NULL,
DROP COLUMN "level",
ADD COLUMN     "level" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Hall" ADD COLUMN     "floorId" TEXT;

-- AlterTable
ALTER TABLE "Timetable" DROP COLUMN "campusId",
DROP COLUMN "courseId",
DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "hallId",
DROP COLUMN "startTime",
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "levelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "courseTaught",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "levelId" TEXT,
ADD COLUMN     "regEmail" TEXT,
DROP COLUMN "level",
ADD COLUMN     "level" INTEGER;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "mainCampusId" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "floorNum" INTEGER NOT NULL,
    "floorPlan" BYTEA,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableSubComponent" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "hallId" TEXT NOT NULL,
    "hall" TEXT NOT NULL,
    "floor" INTEGER,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "day" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableSubComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_mainCampusId_fkey" FOREIGN KEY ("mainCampusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hall" ADD CONSTRAINT "Hall_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSubComponent" ADD CONSTRAINT "TimetableSubComponent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSubComponent" ADD CONSTRAINT "TimetableSubComponent_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableSubComponent" ADD CONSTRAINT "TimetableSubComponent_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;
