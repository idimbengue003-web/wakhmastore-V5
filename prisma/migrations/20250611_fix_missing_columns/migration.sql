-- FixMissingColumns
-- Add any columns that might be missing from the database
-- This handles cases where the database was created via init-db or manual setup
-- and doesn't match the Prisma schema exactly

-- User table: add emailVerified if missing
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);

-- Annonce table: add missing columns
ALTER TABLE "Annonce" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'je_cherche';
ALTER TABLE "Annonce" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Annonce" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "Annonce" ADD COLUMN IF NOT EXISTS "isVip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Annonce" ADD COLUMN IF NOT EXISTS "vipType" TEXT;

-- Annonce indexes (add if missing)
CREATE INDEX IF NOT EXISTS "Annonce_authorId_idx" ON "Annonce"("authorId");
CREATE INDEX IF NOT EXISTS "Annonce_category_idx" ON "Annonce"("category");
CREATE INDEX IF NOT EXISTS "Annonce_type_idx" ON "Annonce"("type");
CREATE INDEX IF NOT EXISTS "Annonce_createdAt_idx" ON "Annonce"("createdAt");
CREATE INDEX IF NOT EXISTS "Annonce_isVip_idx" ON "Annonce"("isVip");

-- Drop Account table if it still exists (OAuth was removed)
DROP TABLE IF EXISTS "Account";

-- Annonce foreign key (add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Annonce_authorId_fkey'
  ) THEN
    ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
