import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GroessenMengenEntry {
  length: number;
  quantity: number;
  mindestmenge: number;
  auto_order_limit: number;
  auto_order_quantity: number;
  warningStatus?: string;
}

interface GroessenMengen {
  [size: string]: GroessenMengenEntry;
}

export const dailyReport = () => {
  cron.schedule("*/60 * * * * *", async () => {
    try {
      // Get all stores where orthotech: true
      const allStores = await prisma.stores.findMany({
        where: {
          orthotech: true,
        },
        include: {
          user: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      console.log(`Found ${allStores.length} stores with orthotech: true`);

      // Process each store
      for (const store of allStores) {
        const groessenMengen = store.groessenMengen as unknown as GroessenMengen;
        
        if (!groessenMengen || typeof groessenMengen !== "object" || Array.isArray(groessenMengen)) {
          console.log(`Store ${store.id} has invalid groessenMengen`);
          continue;
        }

        const updatedGroessenMengen: GroessenMengen = { ...groessenMengen };
        let hasChanges = false;

        // Iterate through each size in groessenMengen
        for (const [sizeStr, sizeData] of Object.entries(groessenMengen)) {
          const size = parseInt(sizeStr);
          
          if (isNaN(size)) {
            console.log(`Invalid size key: ${sizeStr} for store ${store.id}`);
            continue;
          }

          // Check if auto_order_limit is greater than zero
          if (sizeData && typeof sizeData === "object" && "auto_order_limit" in sizeData && sizeData.auto_order_limit > 0) {
            try {
              // Create StoreOrderOverview entry
              await (prisma as any).storeOrderOverview.create({
                data: {
                  storeId: store.id,
                  partnerId: store.userId, // Using store's userId as partnerId
                  size: size,
                  length: sizeData.length,
                  quantity: sizeData.quantity,
                  auto_order_limit: sizeData.auto_order_limit,
                  auto_order_quantity: sizeData.auto_order_quantity,
                  status: "In_bearbeitung", // Default status
                },
              });

              // Decrement auto_order_limit by 1 in the store's groessenMengen
              updatedGroessenMengen[sizeStr] = {
                ...sizeData,
                auto_order_limit: sizeData.auto_order_limit - 1,
              };
              hasChanges = true;

              console.log(
                `Created StoreOrderOverview for store ${store.id}, size ${size}, auto_order_limit: ${sizeData.auto_order_limit} -> ${sizeData.auto_order_limit - 1}`
              );
            } catch (error) {
              console.error(
                `Error creating StoreOrderOverview for store ${store.id}, size ${size}:`,
                error
              );
            }
          }
        }

        // Update the store's groessenMengen if there were changes
        if (hasChanges) {
          try {
            await prisma.stores.update({
              where: { id: store.id },
              data: {
                groessenMengen: updatedGroessenMengen as any,
              },
            });
            console.log(`Updated groessenMengen for store ${store.id}`);
          } catch (error) {
            console.error(`Error updating store ${store.id}:`, error);
          }
        }
      }

      console.log("================================");
    } catch (error) {
      console.error("Error in dailyReport cron job:", error);
    }
  });
};

//---------------------------

// model StoreOrderOverview {
//   id String @id @default(uuid())

//   storeId String
//   store   Stores @relation(fields: [storeId], references: [id], onDelete: Cascade)

//   partnerId String
//   partner   User?  @relation(fields: [partnerId], references: [id], onDelete: Cascade)

//   length              Int
//   quantity            Int
//   auto_order_limit    Int
//   auto_order_quantity Int

//   status StoreOrderOverviewStatus?

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// -----------------------

// Auto order limit → Order quantity

// {
//   "produktname": "New Balance",
//   "hersteller": "New Balance",
//   "artikelnummer": "#10834",
//   "lagerort": "test1",
//   "mindestbestand": 2,
//   "groessenMengen": {
//       "35": {
//           "length": 225,
//           "quantity": 5,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "36": {
//           "length": 230,
//           "quantity": 2,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "37": {
//           "length": 235,
//           "quantity": 1,
//           "mindestmenge": 6,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "38": {
//           "length": 240,
//           "quantity": 5,
//           "mindestmenge": 9,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "39": {
//           "length": 245,
//           "quantity": 5,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "40": {
//           "length": 250,
//           "quantity": 7,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "41": {
//           "length": 255,
//           "quantity": 8,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "42": {
//           "length": 260,
//           "quantity": 7,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "43": {
//           "length": 265,
//           "quantity": 9,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "44": {
//           "length": 270,
//           "quantity": 4,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "45": {
//           "length": 275,
//           "quantity": 3,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "46": {
//           "length": 280,
//           "quantity": 2,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "47": {
//           "length": 285,
//           "quantity": 2,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       },
//       "48": {
//           "length": 290,
//           "quantity": 3,
//           "mindestmenge": 3,
//           "auto_order_limit": 4,
//           "auto_order_quantity": 10
//       }
//   },
//   "purchase_price": 110,
//   "selling_price": 220,
//   "orthotech": false,
//   "opannrit": false,
//   "Status": "Niedriger Bestand"
// }
