import dotenv from "dotenv"
import express from "express"
import { User } from "../db/models"
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

const userRoutes = express.Router()

  .get("/", (req, res) => {
    const token = req.cookies.user

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
      if (typeof decoded !== "string" && decoded.user_id) {
        User.findById(decoded.user_id).then(user => {
          if (user) {
            console.log(user)
            return res.status(200).json({
              name: user.name,
              email: user.email,
              picture: user.image,
              online: user.online
            })
          } else {
            return res.status(401).json({
              message: "User not found"
            })
          }
        })
      } else {
        return res.status(401).json({
          message: "Internal server error"
        })
      }
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token / token doesn't exist"
      })
    }
  })


export default userRoutes