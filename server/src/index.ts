import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import connectToMongoDb from "./db/db"

/* route Imports */
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import chatRoutes from "./routes/chatRoutes"

dotenv.config()
const PORT = process.env.PORT ? process.env.PORT : 8000
const CLIENT_URL = process.env.CLIENT_URL

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: `${CLIENT_URL}`,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"]
}))
app.use(morgan("common"))

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(PORT, () => {
  connectToMongoDb()
  console.log(`Server running on port - ${PORT}`)
})