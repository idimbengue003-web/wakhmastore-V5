-- AddEmailVerifiedColumn
-- Add the missing emailVerified column to User table

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
