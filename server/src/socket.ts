import cookie from "cookie";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { User } from "./db/models";
import { redis } from "./db/redis";
import { timeStamp } from "console";
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

  const currentUserId = socket.userId

  socket.on("userOnline", async (userId) => {

    const status = await redis.hget("online-users", userId)

    // if the user is logging in || if the user already has a status of "online"
    if (status === null || status === "online") {
      await redis.hset("online-users", userId!, "online")

      const friends: string[] = await redis.smembers(`friends-${userId}`)
      console.log("friends", friends)

      if (friends.length === 0) {
        const onlyCurrentUserOnline = { [currentUserId!]: "online" }
        return socket.emit("getOnlineFriends", onlyCurrentUserOnline)
      }

      const onlineUsers: Record<string, string | undefined> = await redis.hgetall("online-users")
      console.log("onlineUsers", onlineUsers)


      const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
        const userStatus = onlineUsers[key]
        if ((key === userId || friends.includes(key)) && userStatus) {
          result[key] = userStatus
        }
        return result
      }, {} as Record<string, string>)

      console.log("filteredOnlineFriends", filteredOnlineFriends)

      return io.emit("getOnlineFriends", filteredOnlineFriends)
    } else if (status === "away") {
      const friends: string[] = await redis.smembers(`friends-${userId}`)
      console.log("friends", friends)

      if (friends.length === 0) {
        const onlyCurrentUserOnline = { [currentUserId!]: "away" }
        return io.emit("getOnlineFriends", onlyCurrentUserOnline)
      }

      const onlineUsers = await redis.hgetall("online-users")

      const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
        const userStatus = onlineUsers[key]
        if ((key === userId || friends.includes(key)) && userStatus) {
          result[key] = userStatus
        }
        return result
      }, {} as Record<string, string>)

      return io.emit("getOnlineFriends", filteredOnlineFriends)
    }
  })

  socket.on("change-status", async (status, userId) => {
    await redis.hset("online-users", userId, status)

    const friends: string[] = await redis.smembers(`friends-${userId}`)
    console.log("friends", friends)
    const onlineUsers = await redis.hgetall("online-users")

    const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      const userStatus = onlineUsers[key]
      if ((key === userId || friends.includes(key)) && userStatus) {
        result[key] = userStatus
      }
      return result
    }, {} as Record<string, string>)
    io.emit("getOnlineFriends", filteredOnlineFriends)
  })

  socket.on("add-friend", async (userId: string) => {
    const onlineUsers: Record<string, string | undefined> = await redis.hgetall("online-users")
    console.log("onlineUsers", onlineUsers)

    const friends: string[] = await redis.smembers(`friends-${userId}`)
    console.log("friends", friends)

    const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      const userStatus = onlineUsers[key]
      if ((key === userId || friends.includes(key)) && userStatus) {
        result[key] = userStatus
      }
      return result
    }, {} as Record<string, string>)

    console.log("filteredOnlineFriends", filteredOnlineFriends)

    return io.emit("getOnlineFriends", filteredOnlineFriends)
  })

  socket.on("connected-to-room", async (chatroomId) => {
    await socket.join(chatroomId);

    io.to(chatroomId).emit("joined-chatroom", `${chatroomId} has joined the room`)
  })

  socket.on("sendMessage", async (message, chatroomId, senderId) => {
    try {
      const timestamp = Date.now()
      await redis.zadd(`messages-${chatroomId}`, timestamp, JSON.stringify({
        message: message,
        senderId: senderId,
        timestamp
      }))
      return io.to(chatroomId).emit("message", message, senderId, timestamp, chatroomId)
    } catch (error) {
      console.log(error)
    }
  })


  socket.on("logout", async (userId: string) => {

    if (!userId) return

    await redis.hdel("online-users", userId)
    const friends: string[] = await redis.smembers(`friends-${userId}`)
    console.log("friends", friends)
    const onlineUsers = await redis.hgetall("online-users")

    const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      const userStatus = onlineUsers[key]
      if ((key === userId || friends.includes(key)) && userStatus) {
        result[key] = userStatus
      }
      return result
    }, {} as Record<string, string>)
    io.emit("getOnlineFriends", filteredOnlineFriends)
  })

  socket.on("disconnect", async () => {
  })
})

export {
  app,
  io,
  server
};
