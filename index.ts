import { PrismaClient } from "@prisma/client";
import app from "./app";

const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

async function ensureCustomerNumberSequenceMinimum() {
  try {
    await prisma.$executeRawUnsafe(`
DO $$
DECLARE
  seq_name text;
  current_max bigint;
BEGIN
  SELECT pg_get_serial_sequence('public.customers', 'customerNumber') INTO seq_name;

  IF seq_name IS NULL THEN
    RAISE NOTICE 'No sequence found for customers.customerNumber. Skipping.';
    RETURN;
  END IF;

  SELECT COALESCE(MAX("customerNumber"), 0) FROM public.customers INTO current_max;

  IF current_max < 999 THEN
    PERFORM setval(seq_name, 999, true); -- next will be 1000
  ELSE
    PERFORM setval(seq_name, current_max, true);
  END IF;
END $$;
    `);
    console.log("customerNumber sequence ensured (min next = 1000)");
  } catch (err) {
    console.error("Failed to ensure customerNumber sequence:", err);
  }
}

app.listen(PORT, async () => {
  try {
    console.log(`Server running on http://localhost:${PORT}`);
    await prisma.$connect();
    console.log("Database connected...");
    await ensureCustomerNumberSequenceMinimum();
  } catch (err) {
    console.error("Database connection error:", err);
  }
});

// api key: AIzaSyA5up7kkJ1THciQC4sHs3HOEcfYzHHt9JA

// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA5up7kkJ1THciQC4sHs3HOEcfYzHHt9JA" \
//   -H 'Content-Type: application/json' \
//   -X POST \
//   -d '{
//     "contents": [
//       {
//         "parts": [
//           {
//             "text": "Explain how AI works in a few words"
//           }
//         ]
//       }
//     ]
//   }'
