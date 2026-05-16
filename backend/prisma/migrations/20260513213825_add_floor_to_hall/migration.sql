-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "code" TEXT,
ADD COLUMN     "floors" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Campus" ADD COLUMN     "city" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "Hall" ADD COLUMN     "floor" INTEGER;
