import dotenv from "dotenv";
import express from "express"
import { redis } from "../db/redis"
import { checkAuthStatus } from "../utils/middleware";
import { User } from "../db/models";
import { Document } from "mongoose";

dotenv.config()

interface IUser extends Document {
  name: string;
  userTag: string;
  image: string;
  friends: IUser[];
}


const friendRoutes = express.Router()

  .get("/", checkAuthStatus, async (req, res) => {
    try {
      const { userId } = req.query

      const user = await User.findById(userId)

      if (!user) {
        return res.status(401).json({
          message: "Unauthenticated, please login first"
        })
      }

      const friendsList = await User.find({
        _id: { $in: user.friends }
      }).select("_id name image userTag")

      const friends = friendsList.map(friend => ({
        userId: friend._id.toString(),
        name: friend.name,
        image: friend.image,
        userTag: friend.userTag
      }))

      return res.status(200).json(friends)
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      })
    }
  })

  .post("/add-friend", checkAuthStatus, async (req, res) => {
    try {
      const { friendUserTag, userId } = await req.body

      const currentUser = await User.findById(userId)

      if (!currentUser) {
        return res.status(404).json({
          message: "Current user not found | Unauthorized"
        })
      }

      const userWithUserTagExists = await User.findOne({
        userTag: friendUserTag
      })


      if (!userWithUserTagExists) {
        return res.status(400).json({
          message: "User with that tag doesn't exist :/"
        })
      }

      if (userWithUserTagExists._id.toString() === userId) {
        return res.status(400).json({
          message: "You cannot befriend yourself :/"
        })
      }

      const isAlreadyFriend = currentUser.friends.includes(userWithUserTagExists._id)

      if (isAlreadyFriend) {
        return res.status(400).json({
          message: "You're already friends with this user!"
        })
      }

      currentUser.friends.push(userWithUserTagExists._id)
      userWithUserTagExists.friends.push(userId)
      await currentUser.save()
      await userWithUserTagExists.save()

      // save user to redis

      // save user to current user's set
      await redis.sadd(`friends-${userId}`, userWithUserTagExists._id.toString())

      // save current user to user's set
      await redis.sadd(`friends-${userWithUserTagExists._id.toString()}`, userId)

      return res.status(200).json({
        friendUserTag,
        friendName: userWithUserTagExists.name,
        friendId: userWithUserTagExists._id.toString()
      })
    } catch (error) {
      res.status(400).json({
        message: "An unexpected error has occured, please try again :("
      })
    }
  })

export default friendRoutes