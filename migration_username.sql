-- Migration to change email to username
-- Run this SQL directly on your database

-- Drop the old unique constraint on email
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";

-- Rename the email column to username
ALTER TABLE "User" RENAME COLUMN "email" TO "username";

-- Add unique constraint on username
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");

-- Update or create the default user with username 'syahrul'
-- This will hash the password 'syahrul2026' (you should run this in your application)
-- Or manually insert/update the user with the correct password hash

-- Note: The password hash for 'syahrul2026' should be generated using bcrypt
-- You can run the seed script after this migration properly set up the user