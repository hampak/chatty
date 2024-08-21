import dotenv from "dotenv"
import express from "express"
import { ChatRoom, User } from "../db/models"
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config()

const chatRoutes = express.Router()
  .post("/add-friend", async (req, res) => {

    const { friendUserTag, userId, userName } = await req.body
    console.log(friendUserTag, userId)

    // either null or entire user data
    const userWithUserTagExists = await User.findOne({
      userTag: friendUserTag
    })

    console.log(userWithUserTagExists)

    if (userWithUserTagExists) {
      const chatRoom = new ChatRoom({
        room_title: `${userWithUserTagExists.name}|${userName}`,
        participants: [userId, userWithUserTagExists._id]
      })

      await chatRoom.save()
    }

    // if (userWithUserTagExists) {

    //   // check if user is already friends with the other user
    //   const userAlreadyFriends = await ChatRoom.findOne({
    //     participants: { $all: [user] }
    //   })

    //   // if the above false, add user to user's friend list
    //   if () {

    //   } else {
    //     // if they are already friends with each other, send error message to client
    //   }
    //   return res.status(200).send(userTag)

    // } else if (userWithUserTagExists === null) {
    //   // send error message to client
    // }

    return res.status(200).send({
      friendUserTag
    })
  })

export default chatRoutes