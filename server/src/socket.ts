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

  // set user's socketID as a string
  redis.hset(`user:${currentUserId}`, "socketId", socket.id)

  socket.on("userOnline", async (userId) => {

    // retrieve the current user's status
    const status = await redis.hget(`user:${userId}`, "status")

    // if the user is logging in || if the user already has a status of "online" (this would be applicable when the user refreshes the client, establishing a new socket connection)
    if (status === null || status === "online") {

      // set current user's status in a string
      await redis.hset(`user:${userId}`, "status", "online")

      // retrieve the current user's friends
      const friends: string[] = await redis.smembers(`friends-${userId}`)

      const currentUserStatus = "online"

      if (friends.length === 0) {
        return io.to(socket.id).emit("retrieveCurrentUser", socket.id, currentUserStatus)
      }

      io.to(socket.id).emit("retrieveCurrentUser", socket.id, currentUserStatus)

      const friendsSocketIdsPromise: Promise<string | null>[] = friends.map(async (friendId) => {
        return await redis.hget(`user:${friendId}`, "socketId")
      })

      const friendDataPromises = friends.map(friendId => {
        return new Promise<[string | null, string | null]>((resolve) => {
          redis.hmget(`user:${friendId}`, "socketId", "status", (err, values) => {
            resolve(values as [string | null, string | null]);
          })
        })
      })


      const friendData: [string | null, string | null][] = await Promise.all(friendDataPromises)
      console.log("friendData", friendData)
      const friendSocketId: (string | null)[] = await Promise.all(friendsSocketIdsPromise)

      const filteredOnlineFriends: Record<string, { status: string | null; socketId: string | null }> = friendData.reduce((result, [socketId, status], index) => {
        const friendId = friends[index]
        if (status && friendId) {
          result[friendId] = { status, socketId };
        }
        return result
      }, {} as Record<string, { status: string | null; socketId: string | null }>);

      io.to(socket.id).emit("retrieveOnlineFriends", filteredOnlineFriends)

      const validFriendSocketIds = friendSocketId.filter(id => id !== null && id !== undefined);

      return validFriendSocketIds.forEach(async id => {
        // send the current user's id + socket id to his/her friends. The client will append / change this value and track it in a state
        io.to(id).emit("getOnlineFriend", currentUserId, socket.id, status)
      })
    } else if (status === "away") {

      // await redis.hset(`user:${userId}`, "status", "away")

      const friends: string[] = await redis.smembers(`friends-${userId}`)
      const currentUserStatus = "away"

      if (friends.length === 0) {
        return io.to(socket.id).emit("retrieveCurrentUser", socket.id, currentUserStatus)
      }

      io.to(socket.id).emit("retrieveCurrentUser", socket.id, currentUserStatus)

      const friendsSocketIdsPromise: Promise<string | null>[] = friends.map(async (friendId) => {
        return await redis.hget(`user:${friendId}`, "socketId")
      })

      const friendDataPromises = friends.map(friendId => {
        return new Promise<[string | null, string | null]>((resolve) => {
          redis.hmget(`user:${friendId}`, "socketId", "status", (err, values) => {
            resolve(values as [string | null, string | null]);
          })
        })
      })

      const friendData: [string | null, string | null][] = await Promise.all(friendDataPromises)
      const friendSocketId: (string | null)[] = await Promise.all(friendsSocketIdsPromise)

      const filteredOnlineFriends: Record<string, { status: string | null; socketId: string | null }> = friendData.reduce((result, [socketId, status], index) => {
        const friendId = friends[index]
        if (status && friendId) {
          result[friendId] = { status, socketId };
        }
        return result
      }, {} as Record<string, { status: string | null; socketId: string | null }>);

      io.to(socket.id).emit("retrieveOnlineFriends", filteredOnlineFriends)

      const validFriendSocketIds = friendSocketId.filter(id => id !== null && id !== undefined);

      return validFriendSocketIds.forEach(async id => {
        // send the current user's id + socket id to his/her friends. The client will append / change this value and track it in a state
        io.to(id).emit("getOnlineFriend", currentUserId, socket.id, status)
      })
    }
  })

  socket.on("change-status", async (status, userId) => {

    await redis.hset(`user:${userId}`, "status", status)

    const friends: string[] = await redis.smembers(`friends-${userId}`)

    if (friends.length === 0) {
      return io.to(socket.id).emit("retrieveCurrentUser", socket.id, status)
    }

    io.to(socket.id).emit("retrieveCurrentUser", socket.id, status)

    const friendsSocketIdsPromise: Promise<string | null>[] = friends.map(async (friendId) => {
      return await redis.hget(`user:${friendId}`, "socketId")
    })

    const friendSocketId: (string | null)[] = await Promise.all(friendsSocketIdsPromise)

    const validSocketIds = friendSocketId.filter(id => id !== null && id !== undefined);

    validSocketIds.push(socket.id)

    validSocketIds.forEach(id => {
      io.to(id).emit("getOnlineFriend", currentUserId, socket.id, status)
    })
  })

  socket.on("add-friend", async (friendId: string, userId: string, socketId: string, status: "online" | "away") => {
    // const onlineUsers = await redis.hgetall("online-users")
    // const friends: string[] = await redis.smembers(`friends-${userId}`)

    // const filteredOnlineFriends: Record<string, string> = Object.keys(onlineUsers).reduce((result, key) => {
    //   const userStatus = onlineUsers[key]
    //   if ((key === userId || friends.includes(key)) && userStatus) {
    //     result[key] = userStatus
    //   }
    //   return result
    // }, {} as Record<string, string>)

    // const friendSocketId = await redis.hget(`userSocketId`, friendId)

    // const friendsSocketIdsPromise: Promise<string | null>[] = friends.map(async (friendId) => {
    //   return await redis.hget(`user:${friendId}`, "socketId")
    // })

    // const friendSocketId: (string | null)[] = await Promise.all(friendsSocketIdsPromise)

    // const validSocketIds = friendSocketId.filter(id => id !== null && id !== undefined);

    const addedFriend = await redis.hmget(`user:${friendId}`, "socketId", "status")

    const friendSocketId = addedFriend[0]
    const friendStatus = addedFriend[1]

    // if the friend isn't logged in (or not online on our app)
    if (!friendSocketId) return

    io.to(socket.id).emit("getOnlineFriend", friendId, friendSocketId, friendStatus)
    io.to(friendSocketId).emit("getOnlineFriend", userId, socketId, status)
    io.to(friendSocketId).emit("added-as-friend")
  })

  socket.on("added-in-chatroom", async (currentUserId, friendIds: string[], chatroomId, onlineFriends) => {

    // receive the socketIds of friends from the client (rather than from the db)
    const friendSocketIds = Object.values(onlineFriends).map(friend => {
      const typedFriend = friend as { status: "online" | "away"; socketId: string };
      return typedFriend.socketId;
    })

    await Promise.all(friendIds.map(async (friendId) => {
      redis.sadd(`participants-${chatroomId}`, friendId)
    }))

    friendSocketIds.forEach(socketId => {
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

  socket.on("sendMessage", async (message, chatroomId, senderId, participantsIds: string[], senderImage, participantsSocketIds: string[]) => {

    try {
      const timestamp = Date.now()
      await redis.zadd(`messages-${chatroomId}`, timestamp, JSON.stringify({
        message,
        senderId,
        timestamp,
        senderImage
      }))

      io.to(chatroomId).emit("message", message, senderId, timestamp, chatroomId, senderImage)

      // receive socket Ids of participants from the client rather than querying redis
      // const friendSocketIds = await Promise.all(participantsIds.map(async (friendId) => {
      //   return redis.hget("userSocketId", friendId)
      // }))

      // const validSocketIds = friendSocketIds.filter(id => id !== null && id !== undefined);

      // validSocketIds.push(socket.id)

      participantsSocketIds.push(socket.id)

      await Promise.all(participantsSocketIds.map(async (socketId): Promise<void> => {
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
