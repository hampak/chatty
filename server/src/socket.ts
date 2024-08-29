import cookie from "cookie";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { ChatRoom, User } from "./db/models";
import { getUsersFriends } from "./utils/friends";
import { redis } from "./db/redis";

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
  },
  connectionStateRecovery: {}
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
          // console.log("User verified - socket")
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

io.on("connection", async (socket: CustomSocket) => {

  // console.log("CLIENT IS CONNECTED", socket.id)
  const userId = socket.userId

  redis.sadd("online-users", userId!)


  socket.on("userOnline", async (userId) => {
    const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
    const friendIds = chatRooms.flatMap(room =>
      room.participants.filter(pId => pId.toString() !== userId)
    )

    const friendIdsAsStrings = friendIds.map(id => id.toString())

    const onlineUsers = await redis.smembers("online-users")
    console.log("onlineUsers", onlineUsers)
    const onlineFriends = onlineUsers.filter(user => friendIdsAsStrings.includes(user))
    // console.log("CONNECT - ", onlineFriends)
    io.emit("getOnlineFriends", onlineFriends)
  })

  // let disconnectTimeout: NodeJS.Timeout

  // socket.on("disconnect", async () => {
  //   disconnectTimeout = setTimeout(async () => {
  //     console.log("disconnected client of ID:", socket.id);
  //     await redis.srem("online-users", userId!)
  //     const updatedOnlineUsers = await redis.smembers("online-users")

  //     const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
  //     const friendIds = chatRooms.flatMap(room =>
  //       room.participants.filter(pId => pId.toString() !== userId)
  //     )
  //     const friendIdsAsStrings = friendIds.map(id => id.toString())
  //     const updatedOnlineFriends = updatedOnlineUsers.filter(user => friendIdsAsStrings.includes(user))
  //     io.emit("getOnlineFriends", updatedOnlineFriends)
  //   }, 2000)
  //   // console.log("disconnected client of ID:", socket.id)
  //   // await redis.srem("online-users", userId!)

  socket.on("disconnect", async () => {
    console.log("disconnected client of ID:", socket.id);
    await redis.srem("online-users", userId!)
    const updatedOnlineUsers = await redis.smembers("online-users")

    const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
    const friendIds = chatRooms.flatMap(room =>
      room.participants.filter(pId => pId.toString() !== userId)
    )
    const friendIdsAsStrings = friendIds.map(id => id.toString())
    const updatedOnlineFriends = updatedOnlineUsers.filter(user => friendIdsAsStrings.includes(user))
    io.emit("getOnlineFriends", updatedOnlineFriends)
  })



  // // io.emit("user-offline", { userId })
})

// socket.on("reconnect", () => {
//   // if (disconnectTimeout) {
//   //   clearTimeout(disconnectTimeout)
//   // }
//   console.log("Reconnected")
// })
// })

export {
  app,
  io,
  server
};
