import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { createServer } from "http";
import { Server } from "socket.io";

// Create HTTP server from express app
const httpServer = createServer(app);

// Setup Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Kitchen master joins kitchen-room
  socket.on("join-kitchen", () => {
    socket.join("kitchen-room");
    console.log("Kitchen master joined kitchen-room");
  });

  // Receptionist joins reception-room
  socket.on("join-reception", () => {
    socket.join("reception-room");
    console.log("Receptionist joined reception-room");
  });

  socket.on("menu-master-notify", (data) => {
    console.log("Menu Master triggered notification for:", data.itemName);
    io.to("kitchen-room").emit("new-menu-notification", data);
    io.to("reception-room").emit("new-menu-notification", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    // Use httpServer instead of app.listen
    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
