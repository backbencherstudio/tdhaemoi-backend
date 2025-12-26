# Migration Guide: createdBy → partnerId

This migration removes the `createdBy` field from the `customers` table and uses only `partnerId`.

## Prerequisites

- Backup your database before running this migration
- Ensure you have access to your database
- Node.js and npm/yarn installed

## Migration Steps

### Step 1: Run the Data Migration Script

First, copy all existing `createdBy` values to `partnerId`:

**Option A: Using TypeScript script (Recommended)**
```bash
npx ts-node scripts/migrate-createdBy-to-partnerId.ts
```

**Option B: Using SQL script directly**
```bash
psql -U your_user -d your_database -f scripts/migrate-createdBy-to-partnerId.sql
```

Or execute the SQL in your database client.

### Step 2: Verify the Migration

Check that all customers have `partnerId` set:
```sql
SELECT COUNT(*) FROM customers WHERE "partnerId" IS NULL;
```

This should return 0 (or handle any remaining nulls manually).

### Step 3: Regenerate Prisma Client

After the data migration, regenerate the Prisma client:
```bash
npx prisma generate
```

### Step 4: Apply Schema Changes

**Option A: Using Prisma Migrate (Recommended for production)**
```bash
npx prisma migrate dev --name remove_createdBy_from_customers
```

**Option B: Using Prisma DB Push (For development)**
```bash
npx prisma db push
```

### Step 5: Verify Application

1. Start your application
2. Test customer creation, updates, and queries
3. Ensure all customer-related endpoints work correctly

## What Changed

### Schema Changes
- Removed `createdBy` field from `customers` model
- Updated `@@unique([partnerId, customerNumber])` constraint
- Added `@@index([partnerId])` for better query performance

### Code Changes
- Updated all references from `createdBy` to `partnerId` in:
  - `module/v1/customers/customers.controllers.ts`
  - `module/v1/question/question.controllers.ts`
  - All customer queries and filters

## Rollback (If Needed)

If you need to rollback:

1. Restore the schema to include `createdBy`:
```prisma
model customers {
  // ... other fields
  createdBy String
  partnerId String
  // ...
}
```

2. Run Prisma migrate:
```bash
npx prisma migrate dev --name restore_createdBy
```

3. Copy data back (if needed):
```sql
UPDATE customers SET "createdBy" = "partnerId" WHERE "createdBy" IS NULL;
```

## Notes

- The migration script safely copies `createdBy` → `partnerId` for all existing records
- If a record already has `partnerId` set and it differs from `createdBy`, it will be updated to match `createdBy`
- All new customers will only use `partnerId` going forward

