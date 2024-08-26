import { createServer } from "http";
import { Server } from "socket.io"
import express from "express"
import dotenv from "dotenv"

dotenv.config()
const CLIENT_URL = process.env.CLIENT_URL

const app = express()

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: `${CLIENT_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
})

io.on("connection", async (socket) => {
  console.log("client is connected", socket.id)

  const userId = socket.handshake.query.userId;
  console.log("current User ID", userId)

  socket.on("disconnect", () => {
    console.log("disconnected client of ID:", socket.id)
  })

  // io.emit("userOnline", ({ userId }))
})

export {
  app,
  io,
  server
}