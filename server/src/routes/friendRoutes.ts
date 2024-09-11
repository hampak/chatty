import dotenv from "dotenv";
import express from "express"
import { redis } from "../db/redis"
import { checkAuthStatus } from "../utils/middleware";

dotenv.config()

const friendRoutes = express.Router()
  .post("/add-friend", checkAuthStatus, async (req, res) => {
    const { friendUserTag, userId, userName, userTag } = await req.body
  })

export default friendRoutes