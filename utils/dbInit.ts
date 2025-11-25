import { PrismaClient } from "@prisma/client";

export async function ensureCustomerNumberSequenceMinimum(prisma: PrismaClient) {
  console.log("incress...")
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('public.customers', 'customerNumber'),
      GREATEST((SELECT COALESCE(MAX("customerNumber"), 0) FROM public.customers), 9999),
      true
    )
  `;
  
}

export async function ensureOrderNumberSequenceMinimum(prisma: PrismaClient) {
  console.log("Setting orderNumber sequence minimum...");
  try {
    // Try with quoted table name first (preserves case: customerOrders)
    await prisma.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('public."customerOrders"', 'orderNumber'),
        GREATEST(
          (SELECT COALESCE(MAX("orderNumber"), 0) FROM public."customerOrders"),
          9999
        ),
        true
      )
    `);
    console.log("Order number sequence set successfully");
  } catch (error: any) {
    // If quoted version fails, try lowercase (customerorders)
    if (error?.code === 'P2010' || error?.meta?.code === '42P01') {
      try {
        await prisma.$executeRawUnsafe(`
          SELECT setval(
            pg_get_serial_sequence('public.customerorders', 'orderNumber'),
            GREATEST(
              (SELECT COALESCE(MAX("orderNumber"), 0) FROM public.customerorders),
              9999
            ),
            true
          )
        `);
        console.log("Order number sequence set successfully");
      } catch (error2: any) {
        // If both fail, table likely doesn't exist yet (migration not run)
        if (error2?.code === 'P2010' || error2?.meta?.code === '42P01') {
          console.log("customerOrders table or sequence not found yet. Run migration first.");
        } else {
          console.error("Error setting orderNumber sequence:", error2);
        }
      }
    } else {
      console.error("Error setting orderNumber sequence:", error);
    }
  }
}