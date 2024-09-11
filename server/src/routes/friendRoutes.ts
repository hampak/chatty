import dotenv from "dotenv";
import express from "express"
import { redis } from "../db/redis"
import { checkAuthStatus } from "../utils/middleware";
import { User } from "../db/models";

dotenv.config()

const friendRoutes = express.Router()

  .get("/", checkAuthStatus, async (req, res) => {
    const { userId } = req.query

    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Unauthenticated, please login first"
      })
    }
  })

  .post("/add-friend", checkAuthStatus, async (req, res) => {
    try {
      const { friendUserTag, userId } = await req.body

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

      const currentUser = await User.findById(userId)

      if (!currentUser) {
        return res.status(404).json({
          message: "Current user not found | Unauthorized"
        })
      }

      const isAlreadyFriend = currentUser.friends.includes(userWithUserTagExists._id)

      if (isAlreadyFriend) {
        return res.status(400).json({
          message: "You're already friends with this user!"
        })
      }

      currentUser.friends.push(userWithUserTagExists._id)
      await currentUser.save()

      // save user to redis

      // save user to current user's set
      await redis.sadd(`friends-${userId}`, userWithUserTagExists._id.toString())

      // save current user to user's set
      await redis.sadd(`friends-${userWithUserTagExists._id.toString()}`, userId)

      return res.status(200).json({
        friendUserTag,
        friendName: userWithUserTagExists.name
      })
    } catch (error) {
      res.status(400).json({
        message: "An unexpected error has occured, please try again :("
      })
    }
  })
export default friendRoutes