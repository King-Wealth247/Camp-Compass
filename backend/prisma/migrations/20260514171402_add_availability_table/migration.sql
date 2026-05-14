-- CreateEnum
CREATE TYPE "ResubmissionStatus" AS ENUM ('unseen', 'validated', 'rejected');

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "lecturerId" TEXT NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT false,
    "mondayTime" TEXT,
    "tuesday" BOOLEAN NOT NULL DEFAULT false,
    "tuesdayTime" TEXT,
    "wednesday" BOOLEAN NOT NULL DEFAULT false,
    "wednesdayTime" TEXT,
    "thursday" BOOLEAN NOT NULL DEFAULT false,
    "thursdayTime" TEXT,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "fridayTime" TEXT,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "saturdayTime" TEXT,
    "resubmission" "ResubmissionStatus" DEFAULT 'unseen',
    "description" TEXT,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
