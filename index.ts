import { PrismaClient } from "@prisma/client";
import app from "./app";
import { ensureCustomerNumberSequenceMinimum, ensureOrderNumberSequenceMinimum } from "./utils/dbInit";

const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();


app.listen(PORT, async () => {
  try {
    console.log(`Server running on http://localhost:${PORT}`);
    await prisma.$connect();
    console.log("Database connected...");
    await ensureCustomerNumberSequenceMinimum(prisma);
    await ensureOrderNumberSequenceMinimum(prisma);
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
