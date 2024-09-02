import dotenv from "dotenv"
import express from "express"
import { User } from "../db/models"
import jwt, { JwtPayload } from 'jsonwebtoken';

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

const userRoutes = express.Router()

  .get("/", async (req, res) => {
    const token = await req.cookies.user
    // console.log("/api/user || token", token)

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
      if (typeof decoded !== "string" && decoded.user_id) {
        User.findById(decoded.user_id).then(user => {
          if (user) {
            res.header("Cache-Control", "no-store")
            console.log("user", user)
            return res.status(200).json({
              id: user._id.toString(),
              name: user.name,
              picture: user.image,
              online: user.online,
              userTag: user.userTag
            })
          } else {
            return res.status(401).json({
              message: "User not found"
            })
          }
        })
      } else {
        return res.status(401).json({
          message: "Invalid JWT"
        })
      }
    } catch (error) {
      return res.status(401).json({
        message: "User not authorized"
      })
    }
  })


export default userRoutes