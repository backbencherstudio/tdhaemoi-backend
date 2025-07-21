"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3001;
const prisma = new client_1.PrismaClient();
app_1.default.listen(PORT, async () => {
    try {
        console.log(`Server running on http://localhost:${PORT}`);
        await prisma.$connect();
        console.log("Database connected...");
    }
    catch (err) {
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
//# sourceMappingURL=index.js.map