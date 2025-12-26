-- Migration Script: Move createdBy to partnerId in customers table
-- 
-- This SQL script:
-- 1. Adds partnerId column if it doesn't exist
-- 2. Copies all data from createdBy column to partnerId column
-- 3. Ensures partnerId is populated for all existing records
-- 
-- Run this script before applying the Prisma migration that removes createdBy
-- 
-- Usage:
--   psql -U your_user -d your_database -f scripts/migrate-createdBy-to-partnerId.sql
--   Or execute in your database client

BEGIN;

-- Step 1: Add partnerId column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS "partnerId" TEXT;

-- Step 2: Update all customers where partnerId is null or different from createdBy
UPDATE customers
SET "partnerId" = "createdBy"
WHERE "createdBy" IS NOT NULL
  AND ("partnerId" IS NULL OR "partnerId" != "createdBy");

-- Step 3: Verify the migration (run this separately to check):
-- SELECT COUNT(*) FROM customers WHERE "partnerId" IS NULL;
-- Should return 0 if migration was successful

-- Step 4: Check for any data inconsistencies (run this separately to check):
-- SELECT id, "createdBy", "partnerId"
-- FROM customers
-- WHERE "createdBy" IS NOT NULL
--   AND "partnerId" IS NOT NULL
--   AND "createdBy" != "partnerId";

COMMIT;

-- After running this script:
-- 1. Review the results
-- 2. Run: npx prisma migrate dev --name remove_createdBy_from_customers
-- 3. Or run: npx prisma db push (if not using migrations)

