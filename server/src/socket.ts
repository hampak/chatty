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
  redis.hset("userSocketId", currentUserId!, socket.id)

  socket.on("userOnline", async (userId) => {

    const status = await redis.hget("online-users", userId)

    // if the user is logging in || if the user already has a status of "online"
    if (status === null || status === "online") {
      const friends: string[] = await redis.smembers(`friends-${userId}`)
      await redis.hset("online-users", userId!, "online")

      if (friends.length === 0) {
        const onlyCurrentUserOnline = { [currentUserId!]: "online" }
        return io.to(socket.id).emit("getOnlineFriends", onlyCurrentUserOnline)
      }

      const onlineUsers: Record<string, string | undefined> = await redis.hgetall("online-users")

      const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
        const userStatus = onlineUsers[key]
        if ((key === userId || friends.includes(key)) && userStatus) {
          result[key] = userStatus
        }
        return result
      }, {} as Record<string, string>)

      const friendSocketIds = await Promise.all(friends.map(async (friendId) => {
        return redis.hget("userSocketId", friendId)
      }))

      const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      validSocketIds.push(socket.id)

      return validSocketIds.forEach(async id => {
        // io.to(socketId).emit("getOnlineFriends", filteredOnlineFriends, filteredOnlineFriendsSocketIds)
        io.to(id).emit("getOnlineFriends", filteredOnlineFriends)
      })
    } else if (status === "away") {
      const friends: string[] = await redis.smembers(`friends-${userId}`)

      if (friends.length === 0) {
        const onlyCurrentUserOnline = { [currentUserId!]: "away" }
        return io.to(socket.id).emit("getOnlineFriends", onlyCurrentUserOnline)
      }

      const onlineUsers = await redis.hgetall("online-users")

      const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
        const userStatus = onlineUsers[key]
        if ((key === userId || friends.includes(key)) && userStatus) {
          result[key] = userStatus
        }
        return result
      }, {} as Record<string, string>)

      const friendSocketIds = await Promise.all(friends.map(async (friendId) => {
        return redis.hget("userSocketId", friendId)
      }))

      const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      validSocketIds.push(socket.id)

      validSocketIds.forEach(socketId => {
        return io.to(socketId).emit("getOnlineFriends", filteredOnlineFriends)
      })
      // return io.emit("getOnlineFriends", filteredOnlineFriends)
    }
  })

  socket.on("change-status", async (status, userId) => {
    await redis.hset("online-users", userId, status)

    const friends: string[] = await redis.smembers(`friends-${userId}`)


    if (friends.length === 0) {
      const onlyCurrentUserOnline = { [currentUserId!]: status }
      return io.to(socket.id).emit("getOnlineFriends", onlyCurrentUserOnline)
    }

    const onlineUsers = await redis.hgetall("online-users")

    const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      const userStatus = onlineUsers[key]
      if ((key === userId || friends.includes(key)) && userStatus) {
        result[key] = userStatus
      }
      return result
    }, {} as Record<string, string>)

    const friendSocketIds = await Promise.all(friends.map(async (friendId) => {
      return redis.hget("userSocketId", friendId)
    }))

    const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

    validSocketIds.push(socket.id)

    validSocketIds.forEach(socketId => {
      return io.to(socketId).emit("getOnlineFriends", filteredOnlineFriends)
    })
    // io.emit("getOnlineFriends", filteredOnlineFriends)
  })

  socket.on("add-friend", async (friendId: string, userId: string) => {
    const onlineUsers = await redis.hgetall("online-users")
    const friends: string[] = await redis.smembers(`friends-${userId}`)

    const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      const userStatus = onlineUsers[key]
      if ((key === userId || friends.includes(key)) && userStatus) {
        result[key] = userStatus
      }
      return result
    }, {} as Record<string, string>)

    const friendSocketId = await redis.hget(`userSocketId`, friendId)

    if (!friendSocketId) return

    io.to(friendSocketId).emit("added-as-friend")
    io.to(friendSocketId).emit("getOnlineFriends", filteredOnlineFriends)
    io.to(socket.id).emit("getOnlineFriends", filteredOnlineFriends)
  })

  socket.on("added-in-chatroom", async (currentUserId, friendIds: string[], chatroomId) => {

    await Promise.all(friendIds.map(async (friendId) => {
      redis.sadd(`participants-${chatroomId}`, friendId)
    }))

    const friendSocketIds = await Promise.all(friendIds.map(async (friendId) => {
      return redis.hget("userSocketId", friendId)
    }))

    const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

    validSocketIds.forEach(socketId => {
      return io.to(socketId).emit("added-in-chatroom")
    })
  })

  socket.on("connected-to-room", async (chatroomId, userId) => {
    await socket.join(chatroomId);
    const timestamp = Date.now()
    const lastSeenTimestamp = await redis.set(`last_seen-${userId}-${chatroomId}`, timestamp)

    io.to(chatroomId).emit("joined-chatroom")
  })

  socket.on("leave-chatroom", async (chatroomId) => {
    await socket.leave(chatroomId)
  })

  socket.on("sendMessage", async (message, chatroomId, senderId, participantsIds: string[]) => {

    try {
      const timestamp = Date.now()
      await redis.zadd(`messages-${chatroomId}`, timestamp, JSON.stringify({
        message: message,
        senderId: senderId,
        timestamp
      }))
      // io.to(chatroomId).emit("lastMessage", message, chatroomId)

      const friendSocketIds = await Promise.all(participantsIds.map(async (friendId) => {
        return redis.hget("userSocketId", friendId)
      }))

      const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      validSocketIds.push(socket.id)

      validSocketIds.forEach(socketId => {
        io.to(socketId).emit("lastMessage", message, chatroomId)
      })

      io.to(chatroomId).emit("message", message, senderId, timestamp, chatroomId)
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
