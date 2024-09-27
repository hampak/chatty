import cookie from "cookie";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { User } from "./db/models";
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

// 1. When user A connects for the first time (or refreshes), send a list of online friends to that user's client
// 2. When user A's friend becomes online, update the other user's friend list so that User B's status is updated
// 3. send a event to user B's friends + in the client, append that new info in the Socket Context.
// 4. When user A refreshes, it's okay because user A's friendList had already been updated in step #2

io.on("connection", async (socket: CustomSocket) => {

  const currentUserId = socket.userId
  redis.hset("userSocketId", currentUserId!, socket.id)

  socket.on("userOnline", async (userId) => {

    const status = await redis.hget("online-users", userId)

    // if the user is logging in || if the user already has a status of "online"
    if (status === null || status === "online") {
      const friends: string[] = await redis.smembers(`friends-${userId}`)
      await redis.hset("online-users", userId!, "online")

      const onlyCurrentUserOnline = { [currentUserId!]: "online" }

      if (friends.length === 0) {
        return io.to(socket.id).emit("getOnlineFriends", onlyCurrentUserOnline)
      }

      const onlineUsers: Record<string, string | undefined> = await redis.hgetall("online-users")

      // const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
      //   const userStatus = onlineUsers[key]
      //   if ((key === userId || friends.includes(key)) && userStatus) {
      //     result[key] = userStatus
      //   }
      //   return result
      // }, {} as Record<string, string>)

      const filteredOnlineFriends: Record<string, string> = friends.reduce((result, friendId) => {
        const userStatus = onlineUsers[friendId];
        if (userStatus) {
          result[friendId] = userStatus;
        }
        return result;
      }, {} as Record<string, string>);

      const friendSocketIds = await Promise.all(friends.map(async (friendId) => {
        return redis.hget("userSocketId", friendId)
      }))

      const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      validSocketIds.push(socket.id)

      return validSocketIds.forEach(async id => {
        // io.to(socketId).emit("getOnlineFriends", filteredOnlineFriends, filteredOnlineFriendsSocketIds)
        io.to(id).emit("getOnlineFriends", filteredOnlineFriends, validSocketIds)
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
        return io.to(socketId).emit("getOnlineFriends", filteredOnlineFriends, validSocketIds)
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
    const timestamp = Date.now()
    await socket.join(chatroomId);
    await redis.set(`last_seen-${userId}-${chatroomId}`, timestamp)

    io.to(chatroomId).emit("joined-chatroom")
    const room = io.sockets.adapter.rooms.get(chatroomId);
    if (room) {
      const socketIds = Array.from(room);
      console.log("Socket Room after join", socketIds);
    } else {
      console.log('Room does not exist or is empty.');
    }
    console.log("Joined the socket room")
    // const lastSeenTimestamp = await redis.set(`last_seen-${userId}-${chatroomId}`, timestamp)
  })

  socket.on("leave-chatroom", async (chatroomId, userId) => {
    const timestamp = Date.now()
    await redis.set(`last_seen-${userId}-${chatroomId}`, timestamp)
    await socket.leave(chatroomId)
    const room = io.sockets.adapter.rooms.get(chatroomId);
    console.log("room", room)
    if (room) {
      const socketIds = Array.from(room);
      console.log("Socket Room after leave", socketIds);
    } else {
      console.log('Room does not exist or is empty.');
    }
    console.log("Left chatroom!")
  })

  socket.on("sendMessage", async (message, chatroomId, senderId, participantsIds: string[], senderImage) => {

    try {
      const timestamp = Date.now()
      await redis.zadd(`messages-${chatroomId}`, timestamp, JSON.stringify({
        message,
        senderId,
        timestamp,
        senderImage
      }))

      io.to(chatroomId).emit("message", message, senderId, timestamp, chatroomId, senderImage)

      const friendSocketIds = await Promise.all(participantsIds.map(async (friendId) => {
        return redis.hget("userSocketId", friendId)
      }))

      const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      validSocketIds.push(socket.id)

      await Promise.all(validSocketIds.map(async (socketId): Promise<void> => {
        return new Promise((resolve) => {
          io.to(socketId).emit("lastMessage", message, chatroomId)
          resolve()
        })
      }))

    } catch (error) {
      console.log(error)
    }
  })


  socket.on("logout", async (userId: string) => {

    if (!userId) return

    await redis.hdel("online-users", userId)
    const friends: string[] = await redis.smembers(`friends-${userId}`)
    // console.log("friends", friends)
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
