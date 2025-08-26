import { PrismaClient } from "@prisma/client";

export async function ensureCustomerNumberSequenceMinimum(prisma: PrismaClient) {
  console.log("incress...")
  await prisma.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('public.customers', 'customerNumber'),
      GREATEST((SELECT COALESCE(MAX("customerNumber"), 0) FROM public.customers), 999),
      true
    )
  `;
}


