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
  console.log("Ensuring order numbers start from 1000 per partner...");
  try {
    // Get all unique partners who have orders
    const partnersWithOrders = await prisma.customerOrders.findMany({
      where: {
        partnerId: { not: null },
      },
      select: {
        partnerId: true,
      },
      distinct: ["partnerId"],
    });

    // For each partner, ensure their order numbers start from at least 1000
    for (const partner of partnersWithOrders) {
      if (!partner.partnerId) continue;

      const maxOrder = await prisma.customerOrders.findFirst({
        where: { partnerId: partner.partnerId },
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });

      // If the max order number is less than 1000, we need to update existing orders
      // This is a one-time migration to ensure all existing orders have numbers >= 1000
      if (maxOrder && maxOrder.orderNumber < 1000) {
        // Update all orders for this partner to start from 1000
        const orders = await prisma.customerOrders.findMany({
          where: { partnerId: partner.partnerId },
          orderBy: { orderNumber: "asc" },
          select: { id: true, orderNumber: true },
        });

        // Update orders starting from 1000
        for (let i = 0; i < orders.length; i++) {
          await prisma.customerOrders.update({
            where: { id: orders[i].id },
            data: { orderNumber: 1000 + i },
          });
        }

        console.log(
          `Updated order numbers for partner ${partner.partnerId} to start from 1000`
        );
      }
    }

    console.log("Order number minimum check completed");
  } catch (error: any) {
    console.error("Error ensuring order number minimum:", error);
    // Don't throw - this is a migration helper, not critical for startup
  }
}