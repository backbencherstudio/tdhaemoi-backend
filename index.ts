import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { appointmentReminderCron, dailyReport } from "./cron/weekly_report";
import app, { allowedOrigins } from "./app";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 1971;

// Create HTTP server and attach Socket.IO before attaching Express app
const server = createServer();

// Attach Socket.IO
export const io = new SocketIOServer(server, {
  path: "/socket.io/",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach Express app handler after Socket.IO so Socket routes are intercepted first
server.on("request", app);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`User with ID: ${userId} joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });

  // Example: receive a message from client
  socket.on("message", (data) => {
    console.log("Message from client:", data);
  });
});

// Start server
server.listen(PORT, async () => {
  try {
    console.log(`Server running on http://localhost:${PORT}`);
    await prisma.$connect();
    console.log("Database connected...");
    dailyReport();
    appointmentReminderCron();
  } catch (err) {
    console.error("Database connection error:", err);
  }
});
