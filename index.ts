import { PrismaClient } from "@prisma/client";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { appointmentReminderCron, dailyReport } from "./cron/weekly_report";
import { allowedOrigins } from "./app";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 1971;

// Create HTTP server from Express
const server = createServer(app);

// Attach Socket.IO
export const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

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
