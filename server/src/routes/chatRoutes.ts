import dotenv from "dotenv"
import express from "express"
import { ChatRoom, User } from "../db/models"
import { checkAuthStatus } from "../utils/middleware"
import { redis } from "../db/redis"

dotenv.config()

const chatRoutes = express.Router()
  .post("/create-chat", checkAuthStatus, async (req, res) => {

    const { friendData, currentUserId, currentUserName, currentUserPicture } = await req.body
    console.log(friendData)

    try {
      if (friendData.length === 0) {
        return res.status(400).json({
          message: "Please choose at least one friend to start a chat with!"
        })
      }

      if (friendData.length === 1) {
        const chatroomAlreadyExists = await ChatRoom.findOne({
          participants: { $all: [friendData[0].friendId, currentUserId] }
        })

        if (chatroomAlreadyExists) {
          // return user to the chatroom page with that specific user
          return res.redirect("")
        }

        const chatRoom = new ChatRoom({
          room_title: `${currentUserName}, ${friendData[0].friendName}`,
          images: [currentUserPicture, friendData[0].friendPicture],
          participants: [currentUserId, friendData[0].friendId]
        })

        await chatRoom.save()

        return res.status(200).json({
          message: `Created a chatroom with ${friendData[0].friendName}`
        })
      }


    } catch (error) {
      return res.status(400).json({
        message: "Internal server error"
      })
    }

    // try {
    //   const { friendData, currentUserId } = await req.body

    //   console.log(friendData)

    //   if (friendData.length === 0) {
    //     return res.status(400).json({
    //       message: "Please choose at least one friend to start a chat with!"
    //     })
    //   }

    //   // if the user is trying to start a 1 on 1 chat
    //   if (friendData.length === 1) {
    //     const chatroomAlreadyExists = await ChatRoom.findOne({
    //       participants: { $all: [currentUserId, userIdArray[0]] }
    //     })

    //     // redirect user to the chatroom page with this specific user
    //     if (chatroomAlreadyExists) {
    //       return res.redirect("")
    //     }
    //   }

    //   const chatRoom = new ChatRoom({

    //   })
    // } catch (error) {

    // }



    // if (userWithUserTagExists) {

    //   // check if user is already friends with the other user
    //   const userAlreadyFriends = await ChatRoom.findOne({
    //     participants: { $all: [userId, userWithUserTagExists._id] }
    //   })

    //   if (userAlreadyFriends) {
    //     return res.status(400).json({
    //       message: "You're already friends with this user!"
    //     })
    //   } else {
    //     const chatRoom = new ChatRoom({
    //       room_title: `${userWithUserTagExists.name}|${userName}`,
    //       participants: [userId, userWithUserTagExists._id],
    //       images: [userImage, userWithUserTagExists.image]
    //     })

    //     await chatRoom.save()

    //     // save friend as current user's friend in redis set
    //     await redis.sadd(`friends-${userId}`, userWithUserTagExists._id.toString())

    //     // save current user friend's friend in redis set
    //     await redis.sadd(`friends-${userWithUserTagExists._id.toString()}`, userId)

    //     return res.status(200).json({
    //       friendUserTag,
    //       friendId: userWithUserTagExists._id.toString()
    //     })
    //   }

    // } else if (userWithUserTagExists === null) {
    //   return res.status(400).json({
    //     message: "A user with that user tag doesn't exist :( Please check again"
    //   })
    // }
  })

  .get("/chat-list", checkAuthStatus, async (req, res) => {
    const { userId } = req.query

    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Unauthenticated, please login first"
      })
    }

    const { name, image } = user

    try {
      const data = await ChatRoom.find({
        participants: userId
      })

      const chatRooms = data.map(room => {

        const allParticipants = room.room_title.split("|").map(p => p.trim())
        const friendName = allParticipants.find(p => p !== name)

        const friendImage = room.images.find(i => i !== image)

        return {
          id: room._id,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          title: friendName,
          participants: room.participants,
          image: friendImage
        }
      })
      console.log("chat-rooms", chatRooms)
      res.status(200).json(chatRooms)
    } catch (error) {
      res.status(400).json({
        message: "Error while querying your list of messages"
      })
    }
  })

  .get("/chat-info", checkAuthStatus, async (req, res) => {
    const { chatId, userId } = req.query

    const chatRoomInfo = await ChatRoom.findById(chatId)
    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Not authenticated"
      })
    }

    if (!chatRoomInfo) {
      return res.status(200).json({
        message: "Chatroom not found :/"
      })
    }

    const rawMessages = await redis.zrange(`messages-${chatId}`, 0, -1, "WITHSCORES")
    const messages = []
    for (let i = 0; i < rawMessages.length; i += 2) {
      const messageJson = rawMessages[i]
      const timestamp = rawMessages[i + 1]
      if (messageJson && timestamp) {
        const message = JSON.parse(messageJson!)
        message.timeStamp = parseInt(timestamp!, 10)
        messages.push(message)
      }
    }

    const { name } = user
    const { room_title, createdAt, _id } = chatRoomInfo

    const allParticipants = room_title.split("|").map(p => p.trim())
    const friendName = allParticipants.find(p => p !== name)

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    const date = new Date(createdAt)
    const formattedDate = date.toLocaleString(undefined, options)

    return res.status(200).json({
      chatroomId: _id,
      title: friendName,
      participants: allParticipants,
      createdAt: formattedDate,
      messages
    })
  })

export default chatRoutes