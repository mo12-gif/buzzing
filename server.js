const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", ({ room, playerName }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = { host: socket.id, players: [] };
    }
    rooms[room].players.push({ id: socket.id, name: playerName });
    console.log(`${playerName} joined room ${room}`);
  });

  socket.on("buzz", ({ room, playerName }) => {
    if (rooms[room]) {
      io.to(room).emit("buzzed", playerName);
    }
  });

  socket.on("reset", (room) => {
    if (rooms[room] && rooms[room].host === socket.id) {
      io.to(room).emit("reset");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
