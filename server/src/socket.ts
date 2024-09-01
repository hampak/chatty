import cookie from "cookie";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { User } from "./db/models";
import { redis } from "./db/redis";
import cors from "cors"

interface CustomSocket extends Socket {
  userId?: string
}

dotenv.config()
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET

const app = express()

app.use(cors({
  // origin: `${CLIENT_URL}`,
  origin: "https://tims-chatty.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

const server = createServer(app)

const io = new Server(server, {
  cors: {
    // origin: `${CLIENT_URL}`,
    origin: "https://tims-chatty.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true,
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

  socket.on("userOnline", async (userId) => {
    const start = process.hrtime();

    const status = await redis.hget("online-users", userId)

    if (status === null || status === "online") {
      await redis.hset("online-users", userId!, "online")

      const friends: string[] = await redis.smembers(`friends-${userId}`)
      console.log("friends", friends)

      const onlineUsers: Record<string, string | undefined> = await redis.hgetall("online-users")
      console.log("onlineUsers", onlineUsers)

      const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
        const userStatus = onlineUsers[key]
        if ((key === userId || friends.includes(key)) && userStatus) {
          result[key] = userStatus
        }
        return result
      }, {} as Record<string, string>)

      const end = process.hrtime(start)
      const responseTime = (end[0] + 1e3 + end[1] / 1e6)

      return io.emit("getOnlineFriends", filteredOnlineFriends, responseTime)
    } else if (status === "away") {
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

      const end = process.hrtime(start)
      const responseTime = (end[0] + 1e3 + end[1] / 1e6)

      return io.emit("getOnlineFriends", filteredOnlineFriends, responseTime)
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