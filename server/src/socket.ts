import cookie from "cookie";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { ChatRoom, User } from "./db/models";
import { getUsersFriends } from "./utils/friends";

interface CustomSocket extends Socket {
  userId?: string
}

dotenv.config()
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET

const app = express()

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: `${CLIENT_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
})

const authenticateSocket = async (socket: CustomSocket, next: any) => {
  const cookieHeader = socket.request.headers.cookie

  const cookies = cookie.parse(cookieHeader || "");
  const userCookie = cookies["user"]

  if (!userCookie) {
    return next(new Error("Authentication Error - You must be logged in for socket connection"))
  }

  try {
    const decoded = jwt.verify(userCookie, JWT_SECRET!) as JwtPayload
    if (typeof decoded !== "string" && decoded.user_id) {
      await User.findById(decoded.user_id).then(user => {
        if (user) {
          console.log("User verified - socket")
          socket.userId = user._id.toString()
          return next()
        } else {
          console.log("User NOT verified - socket")
          return next(new Error("Authentication Error - You must be logged in for socket connection"))
        }
      })
    } else {
      console.log("User NOT verified - socket")
      return next(new Error("Authentication Error - You must be logged in for socket connection"))
    }
  } catch (error) {
    console.log("User NOT verified - socket")
    return next(new Error("Authentication Error - You must be logged in for socket connection"))
  }
}

io.use(authenticateSocket)

const onlineUsers = new Map();

io.on("connection", async (socket: CustomSocket) => {

  console.log("CLIENT IS CONNECTED", socket.id)

  const userId = socket.userId

  io.emit("userOnline", { userId })
  console.log("ID OF ONLINE USER", userId)

  // if (!userId) return

  // onlineUsers.set(userId, socket.id)

  // console.log(onlineUsers)


  // const chatRooms = await ChatRoom.find({
  //   participants: userId
  // }).populate('participants')

  // console.log("chatRooms", chatRooms)


  // chatRooms.forEach(room => {
  //   room.participants.forEach(participant => {
  //     if (participant._id.toString() !== userId) {
  //       console.log("participant", participant.toString())
  //       if (!onlineUsers.has(participant._id.toString())) {
  //         onlineUsers.set(participant.id.toString(), "")
  //       }
  //     }
  //   })
  // })

  // console.log(onlineUsers)

  // const userRoom = `userRoom_${userId}`
  // socket.join(userRoom)
  // chatRooms.forEach(room => {
  //   room.participants.forEach(async participant => {
  //     if (participant._id.toString() !== userId) {
  //       const participantSocketId = onlineUsers.get(participant._id.toString())
  //       if (participantSocketId) {
  //         io.to(userRoom).emit("userOnline", { userId: participant._id.toString() })
  //       }
  //     }
  //   })
  // })

  socket.on("disconnect", () => {
    console.log("disconnected client of ID:", socket.id)
    io.emit("userOffline", { userId })
  })
})

export {
  app,
  io,
  server
};
