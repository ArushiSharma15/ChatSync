import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http'

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join_room", (data) => {

        console.log("Join room data received:", data);

        const { username, room } = data;

        socket.join(room);

        socket.to(room).emit("user_joined", {
            username: username
        });

        console.log(
            `User ${username} (${socket.id}) joined room : ${room}`
        );
    });

    socket.on("send_message", (data) => {

        console.log("send message data ", data);

        socket.to(data.room).emit("receive_message", data);
    });

    socket.on("typing", (data) => {

        socket.to(data.room).emit("user_typing", {
            username: data.username
        });
    });

    socket.on("stop_typing", (data) => {

        socket.to(data.room).emit("user_stop_typing", {
            username: data.username
        });
    });

    socket.on("leave_room", (data) => {

        socket.to(data.room).emit("user_left", {
            username: data.username
        });

        socket.leave(data.room);

        console.log(
            `User ${data.username} (${socket.id}) left room : ${data.room}`
        );
    });

    socket.on("disconnect", () => {

        console.log("User Disconnected..", socket.id);
    });
});

server.listen(process.env.PORT || 1000, () => {
    console.log("Server is running");
});