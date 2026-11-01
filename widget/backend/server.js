
// Node.js + Express + Socket.io Backend
// File: server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || "*";
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: corsOrigin
}));

const conversations = {}; // { storeId: [ { text, from, timestamp } ] }

io.on("connection", (socket) => {
  const { storeId, userId } = socket.handshake.query;

  if (!storeId || !userId) {
    socket.disconnect();
    return;
  }

  socket.join(storeId);
  console.log(`User ${userId} connected to store ${storeId}`);

  socket.on("typing", ({ storeId, from }) => {
    socket.to(storeId).emit("typing", { from });
  });
  
  socket.on("message", (msg) => {
    msg.timestamp = new Date();
    if (!conversations[storeId]) conversations[storeId] = [];
    conversations[storeId].push(msg);

    // Broadcast to everyone in the store room
    io.to(storeId).emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected from store ${storeId}`);
  });
});

app.get("/health", (req, res) => {
  res.send("Chat server running!");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});