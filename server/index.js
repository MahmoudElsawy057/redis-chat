const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const redis = require("redis");
const client = redis.createClient();
// import { createClient } from "redis";
// const client = createClient();
// client.on("error", (err) => console.log("Redis Client Error", err));
// await client.connect();

client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use(cors());

const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  },
});

async function sendMessage(socket, room) {
  const list = await client.lRange("messages", 0, -1);

  list.map((x) => {
    const usernameMessage = x.split(";");
    const redisMessageRoom = usernameMessage[0];
    const redisUsername = usernameMessage[1];
    const redisMessage = usernameMessage[2];
    const redisMessageTime = usernameMessage[3];
    if (redisMessageRoom == room) {
      socket.emit("recieve_message", {
        room: redisMessageRoom,
        author: redisUsername,
        message: redisMessage,
        time: redisMessageTime,
      });
    }
  });
}

io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    sendMessage(socket, room);
    // console.log(socket.id, "connected");
    // console.log(room);
    socket.join(room);
  });

  socket.on("send_message", ({ room, author, message, time }) => {
    client.rPush("messages", `${room};${author};${message};${time}`);

    socket.to(room).emit("recieve_message", { room, author, message, time });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => console.log("server is runnin"));
