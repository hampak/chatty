import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import connectToMongoDb from "./db/db"

import { app, server } from "./socket"

/* route Imports */
import { redis } from "./db/redis"
import authRoutes from "./routes/authRoutes"
import chatRoutes from "./routes/chatRoutes"
import userRoutes from "./routes/userRoutes"

dotenv.config()
const PORT = process.env.PORT ? process.env.PORT : 8000
const CLIENT_URL = process.env.CLIENT_URL

// const app = express()

app.use(cookieParser())
app.use(express.json())
// app.use(cors({
//   // origin: `${CLIENT_URL}`,
//   origin: "https://chatty-server-production-8624.up.railway.app",
//   credentials: true,
//   methods: ["GET", "POST", "DELETE", "PUT"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }))
app.use(morgan("common"))

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/chat", chatRoutes)

server.listen(PORT, async () => {
  await connectToMongoDb()
  try {
    const isConnectedToRedis = await redis.ping()
    if (isConnectedToRedis) {
      console.log("Connected to Redis")
    }
  } catch (error) {
    console.log("Error connecting to Redis", error)
  }
  console.log(`Server running on port - ${PORT}`)
})