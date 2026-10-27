-- Migration: add_timetable_publication
-- Generated manually for Prisma 5.5.0
-- Apply with: prisma migrate deploy (once DB is running)

-- Create enums
CREATE TYPE "TimetableGenerationMode" AS ENUM ('absolute', 'batch', 'unit');
CREATE TYPE "TimetableStatus" AS ENUM ('draft', 'published', 'archived');

-- Add new columns to Timetable
ALTER TABLE "Timetable"
  ADD COLUMN IF NOT EXISTS "status"         "TimetableStatus"          NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS "generationMode" "TimetableGenerationMode"  NOT NULL DEFAULT 'absolute',
  ADD COLUMN IF NOT EXISTS "publishedAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "publishedBy"    TEXT,
  ADD COLUMN IF NOT EXISTS "snapshotOf"     TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT NOW();
