/**
 * Migration Script: Move createdBy to partnerId in customers table
 * 
 * This script:
 * 1. Copies all data from createdBy column to partnerId column
 * 2. Ensures partnerId is populated for all existing records
 * 
 * Run this script before applying the Prisma migration that removes createdBy
 * 
 * Usage:
 *   npx ts-node scripts/migrate-createdBy-to-partnerId.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateCreatedByToPartnerId() {
  try {
    console.log("Starting migration: createdBy -> partnerId\n");

    // Step 1: Check if partnerId column exists
    let partnerIdColumnExists = false;
    try {
      await prisma.$queryRaw`
        SELECT "partnerId" FROM customers LIMIT 1
      `;
      partnerIdColumnExists = true;
      console.log("✅ partnerId column already exists");
    } catch (error: any) {
      if (error.code === "P2010" || error.meta?.code === "42703") {
        console.log("ℹ️  partnerId column does not exist yet, will create it");
        partnerIdColumnExists = false;
      } else {
        throw error;
      }
    }

    // Step 2: Add partnerId column if it doesn't exist
    if (!partnerIdColumnExists) {
      console.log("\nStep 1: Adding partnerId column to customers table...");
      await prisma.$executeRaw`
        ALTER TABLE customers 
        ADD COLUMN IF NOT EXISTS "partnerId" TEXT
      `;
      console.log("✅ partnerId column added");
    }

    // Step 3: Check if createdBy column exists and has data
    console.log("\nStep 2: Checking for customers with createdBy data...");
    const customersWithCreatedBy = await prisma.$queryRaw<
      Array<{ id: string; createdBy: string }>
    >`
      SELECT id, "createdBy"
      FROM customers
      WHERE "createdBy" IS NOT NULL
      LIMIT 10
    `;

    if (customersWithCreatedBy.length === 0) {
      console.log("⚠️  No customers found with createdBy field.");
      console.log("Migration may not be needed, or all data is already migrated.");
      return;
    }

    console.log(`✅ Found customers with createdBy data (showing ${customersWithCreatedBy.length} sample records)`);

    // Step 4: Count total records to migrate
    const totalCount = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*) as count
      FROM customers
      WHERE "createdBy" IS NOT NULL
    `;
    const total = Number(totalCount[0]?.count || 0);
    console.log(`\nTotal customers to migrate: ${total}`);

    // Step 5: Copy data from createdBy to partnerId
    console.log("\nStep 3: Copying data from createdBy to partnerId...");
    const updateResult = await prisma.$executeRaw`
      UPDATE customers
      SET "partnerId" = "createdBy"
      WHERE "createdBy" IS NOT NULL
        AND ("partnerId" IS NULL OR "partnerId" != "createdBy")
    `;

    console.log(`✅ Updated ${updateResult} customer records`);

    // Step 6: Verify the migration
    console.log("\nStep 4: Verifying migration...");
    const customersWithNullPartnerId = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*) as count
      FROM customers
      WHERE "partnerId" IS NULL
    `;

    const nullCount = Number(customersWithNullPartnerId[0]?.count || 0);
    
    if (nullCount > 0) {
      console.warn(`⚠️  Warning: ${nullCount} customers still have null partnerId`);
      console.warn("These records may need manual attention.");
    } else {
      console.log("✅ All customers now have partnerId set");
    }

    // Step 7: Check for any data inconsistencies
    const inconsistentRecords = await prisma.$queryRaw<
      Array<{ id: string; createdBy: string; partnerId: string }>
    >`
      SELECT id, "createdBy", "partnerId"
      FROM customers
      WHERE "createdBy" IS NOT NULL
        AND "partnerId" IS NOT NULL
        AND "createdBy" != "partnerId"
      LIMIT 10
    `;

    if (inconsistentRecords.length > 0) {
      console.warn(`⚠️  Warning: Found ${inconsistentRecords.length} records where createdBy != partnerId`);
      console.warn("These records had different values and partnerId was updated to match createdBy");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Review the migration results above");
    console.log("2. Run: npx prisma generate (to regenerate Prisma client)");
    console.log("3. Run: npx prisma migrate dev --name remove_createdBy_from_customers");
    console.log("   Or: npx prisma db push (if not using migrations)");

  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCreatedByToPartnerId()
  .then(() => {
    console.log("\nMigration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration script failed:", error);
    process.exit(1);
  });

