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
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000
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
  const userId = socket.userId

  redis.hset("online-users", userId!, "online")

  socket.on("userOnline", async (userId) => {
    const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
    const friendIds = chatRooms.flatMap(room =>
      room.participants.map(pId => pId.toString())
    )

    if (!friendIds.includes(userId.toString())) {
      friendIds.push(userId.toString())
    }


    const onlineUsers = await redis.hgetall("online-users")
    io.emit("getOnlineFriends", onlineUsers)
  })

  socket.on("change-status", async (status, userId) => {
    console.log(status, userId)
    await redis.hset("online-users", userId, status)
    const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
    const friendIds = chatRooms.flatMap(room =>
      room.participants.map(pId => pId.toString())
    )

    if (!friendIds.includes(userId!.toString())) {
      friendIds.push(userId!.toString())
    }

    const onlineUsers = await redis.hgetall("online-users")
    io.emit("getOnlineFriends", onlineUsers)
  })

  socket.on("logout", async (userId: string) => {

    if (!userId) return

    await redis.hdel("online-users", userId)
    const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
    const friendIds = chatRooms.flatMap(room =>
      room.participants.map(pId => pId.toString())
    )

    if (!friendIds.includes(userId!.toString())) {
      friendIds.push(userId!.toString())
    }

    const onlineUsers = await redis.hgetall("online-users")
    io.emit("getOnlineFriends", onlineUsers)
  })

  socket.on("disconnect", async () => {
  })
})

export {
  app,
  io,
  server
};

// io.on("connection", async (socket: CustomSocket) => {

//   // console.log("CLIENT IS CONNECTED", socket.id)
//   const userId = socket.userId

//   redis.sadd("online-users", userId!)

//   socket.on("userOnline", async (userId) => {
//     const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
//     const friendIds = chatRooms.flatMap(room =>
//       room.participants.map(pId => pId.toString())
//     )

//     if (!friendIds.includes(userId.toString())) {
//       friendIds.push(userId.toString())
//     }

//     const onlineUsers = await redis.smembers("online-users")
//     console.log("onlineUsers", onlineUsers)
//     const onlineFriends = onlineUsers.filter(user => friendIds.includes(user))
//     // console.log("CONNECT - ", onlineFriends)
//     io.emit("getOnlineFriends", onlineFriends)
//   })

//   socket.on("disconnect", async () => {
//     // console.log("disconnected client of ID:", socket.id);
//     await redis.srem("online-users", userId!)
//     const updatedOnlineUsers = await redis.smembers("online-users")

//     const chatRooms = await ChatRoom.find({ participants: userId }).select("participants")
//     const friendIds = chatRooms.flatMap(room =>
//       room.participants.map(pId => pId.toString())
//     )

//     if (!friendIds.includes(userId!.toString())) {
//       friendIds.push(userId!.toString())
//     }
//     const onlineFriends = updatedOnlineUsers.filter(user => friendIds.includes(user))
//     io.emit("getOnlineFriends", onlineFriends)
//   })
//   // io.emit("user-offline", { userId })
// })

// So this was my original code. So as I've said above, the main problem I was having was distinguishing between if the user really closed the tab (or logged out) or if it was just a page refresh.