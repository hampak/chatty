import dotenv from "dotenv"
import express from "express"
import { ChatRoom, User } from "../db/models"

dotenv.config()

const chatRoutes = express.Router()
  .post("/add-friend", async (req, res) => {

    const { friendUserTag, userId, userName, userTag } = await req.body

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
          participants: [userId, userWithUserTagExists._id]
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

    try {
      const chatRooms = await ChatRoom.find({
        participants: userId
      })
      console.log(chatRooms)
      res.status(200).json(chatRooms)
    } catch (error) {

    }

    console.log(userId)
  })

export default chatRoutes