import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import connectToMongoDb from "./db/db"

/* route Imports */
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"

dotenv.config()
const PORT = process.env.PORT ? process.env.PORT : 8000
const CLIENT_URL = process.env.CLIENT_URL

const app = express()

app.use(express.json())
app.use(cors({
  origin: `${CLIENT_URL}`,
  credentials: true
}))
app.use(cookieParser())
app.use(morgan("common"))

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)

app.listen(PORT, () => {
  connectToMongoDb()
  console.log(`Server running on port - ${PORT}`)
})