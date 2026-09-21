const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Enable CORS for ALL Express routes & preflight requests
app.use(cors({ origin: "*", credentials: true }));

const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8, // Allow up to 100MB payloads
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/", "index.html"));
});

io.on("connection", (socket) => {
  console.log("Socket connected: ", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send-image", ({ roomId, imageData }) => {
    console.log(`Relaying image to room: ${roomId} (Data length: ${imageData ? imageData.length : 0})`);
    socket.to(roomId).emit("receive-image", imageData);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(2000, () => {
  console.log("Server is listening at http://localhost:2000");
});