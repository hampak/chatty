import dotenv from "dotenv"
import express from "express"
import { ChatRoom, User } from "../db/models"
import { checkAuthStatus } from "../utils/middleware"

dotenv.config()

const chatRoutes = express.Router()
  .post("/add-friend", checkAuthStatus, async (req, res) => {

    const { friendUserTag, userId, userName, userTag, userImage } = await req.body

    // either null or entire user data
    const userWithUserTagExists = await User.findOne({
      userTag: friendUserTag
    })

    // check to see if the user is trying to befriend him/herself
    if (friendUserTag === userTag) {
      return res.status(400).json({
        message: "Cannot befriend yourself :/"
      })
    }

    if (userWithUserTagExists) {

      // check if user is already friends with the other user
      const userAlreadyFriends = await ChatRoom.findOne({
        participants: { $all: [userId, userWithUserTagExists._id] }
      })

      if (userAlreadyFriends) {
        return res.status(400).json({
          message: "You're already friends with this user!"
        })
      } else {
        const chatRoom = new ChatRoom({
          room_title: `${userWithUserTagExists.name}|${userName}`,
          participants: [userId, userWithUserTagExists._id],
          images: [userImage, userWithUserTagExists.image]
        })

        await chatRoom.save()

        return res.status(200).json({
          friendUserTag
        })
      }

    } else if (userWithUserTagExists === null) {
      return res.status(400).json({
        message: "A user with that user tag doesn't exist :( Please check again"
      })
    }
  })

  .get("/chat-list", async (req, res) => {
    const { userId } = req.query

    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Unauthenticated, please login first"
      })
    }

    const { name, image } = user

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
    res.status(200).json(chatRooms)
  })

  .get("/chat-info", async (req, res) => {
    console.log("called")
    const { chatId, userId } = req.query

    console.log("chatId", chatId, "userId", userId)

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

    const { name } = user
    const { room_title, participants, images, createdAt } = chatRoomInfo

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
      title: friendName,
      participants: allParticipants,
      createdAt: formattedDate
    })
  })

export default chatRoutes