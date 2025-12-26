# Migration Status: createdBy → partnerId

## ✅ Completed

### Schema Changes
- ✅ Removed `createdBy` from `customers` model in `prisma/schema.prisma`
- ✅ Updated unique constraint: `@@unique([partnerId, customerNumber])`
- ✅ Added index: `@@index([partnerId])`
- ✅ Added relation: `partner User @relation(fields: [partnerId], references: [id], onDelete: Cascade)`

### Code Changes
- ✅ `module/v1/customers/customers.controllers.ts` - All `createdBy` references updated to `partnerId`
- ✅ `module/v1/question/question.controllers.ts` - Updated to use `customer.partnerId`
- ✅ `module/v1/versorgungen/versorgungen.controllers.ts` - Already uses `partnerId` (commented code has old references but is inactive)

### Migration Scripts
- ✅ `scripts/migrate-createdBy-to-partnerId.ts` - TypeScript migration script (updated to add column if missing)
- ✅ `scripts/migrate-createdBy-to-partnerId.sql` - SQL migration script (updated to add column if missing)

## ⚠️ Required Steps

### Step 1: Run Data Migration
```bash
npx ts-node scripts/migrate-createdBy-to-partnerId.ts
```

This will:
- Add `partnerId` column if it doesn't exist
- Copy all `createdBy` values to `partnerId`
- Verify the migration

### Step 2: Regenerate Prisma Client
**This is critical!** The Prisma client must be regenerated to recognize the new schema:

```bash
npx prisma generate
```

### Step 3: Apply Schema Changes
```bash
# Option A: Using migrations (recommended for production)
npx prisma migrate dev --name remove_createdBy_from_customers

# Option B: Using db push (for development)
npx prisma db push
```

## 🔍 Current Error

The error you're seeing:
```
Unknown argument `partnerId`. Available options are marked with ?.
```

This happens because:
1. The Prisma client was generated with the old schema (which had `createdBy`)
2. The code is trying to use `partnerId` which doesn't exist in the generated client yet
3. **Solution**: Run `npx prisma generate` after the data migration

## 📝 Notes

- All commented code with `createdBy` references can be left as-is (they're inactive)
- The active code in `versorgungen.controllers.ts` already uses `partnerId` correctly
- After regenerating Prisma client, all errors should resolve


