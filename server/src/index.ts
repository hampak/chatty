import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"

/* Auth Imports */
import authRoutes from "./routes/authRoutes"
import connectToMongoDb from "./db/db"
import { User } from "./db/models"

dotenv.config()
const PORT = process.env.PORT ? process.env.PORT : 8000

const app = express()

app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(cookieParser())
app.use(morgan("common"))

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
  connectToMongoDb()
  console.log(`Server running on port - ${PORT}`)
})