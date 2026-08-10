import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import pinRoutes from "./routes/pin.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// MIDDLEWARE
app.use(
  cors({
    origin: "*",
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(
  "/uploads",
  express.static(uploadsDir)
);
// ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/messages", messageRoutes);

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // USER JOINS THEIR OWN ROOM
  socket.on("joinUser", (userId) => {
    if (!userId) {
      return;
    }

    const room = `user_${userId}`;

    socket.join(room);

    console.log(
      `User ${userId} joined ${room}`
    );
  });

  // SEND REAL-TIME MESSAGE
  socket.on(
    "sendMessage",
    (message) => {
      if (!message) {
        return;
      }

      const receiverId =
        message.receiver?._id ||
        message.receiver;

      const senderId =
        message.sender?._id ||
        message.sender;

      if (!receiverId || !senderId) {
        return;
      }

      // Send to receiver
      io.to(`user_${receiverId}`).emit(
        "newMessage",
        message
      );

      // Send back to sender's other devices
      io.to(`user_${senderId}`).emit(
        "messageSent",
        message
      );
    }
  );

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

// MONGODB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(5000, () => {
      console.log(
        "Server running on port 5000"
      );
    });
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err
    );
  });