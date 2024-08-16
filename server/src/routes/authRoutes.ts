import dotenv from "dotenv"
import express from "express"
import { OAuth2Client } from "google-auth-library"

dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const authRoutes = express.Router()

  /* Google auth */
  .get("/google", (req, res) => {

  })


export default authRoutes