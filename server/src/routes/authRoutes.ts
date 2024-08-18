import dotenv from "dotenv"
import express from "express"
import { OAuth2Client } from "google-auth-library"

dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)


const authRoutes = express.Router()

  /* Google auth */
  .get("/google", (req, res) => {

    const userCookie = req.cookies.user

    if (userCookie) {
      return res.redirect(`${CLIENT_URL}/dashboard`)
    }

    res.header("Access-Control-Allow-Origin", CLIENT_URL);
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header("Referrer-Policy", "no-referrer-when-downgrade");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: 'https://www.googleapis.com/auth/userinfo.profile  openid ',
      prompt: "consent"
    })

    res.redirect(authUrl)
  })

  .get("/google/callback", async (req, res) => {
    const code = req.query.code

    if (typeof code !== "string") {
      return res.status(400).send("Invalid authorization code")
    }

    try {
      const { tokens } = await oauth2Client.getToken(code)
      oauth2Client.setCredentials(tokens)

      const id_token = tokens.id_token

      const ticket = await oauth2Client.verifyIdToken({
        idToken: id_token!,
        audience: GOOGLE_CLIENT_ID
      })

      const user = ticket.getPayload()

      res.cookie("user", JSON.stringify({
        id: user?.sub,
        email: user?.email,
        name: user?.name,
        picture: user?.picture,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60 * 1000,
        // sameSite: "none"
      })

      res.redirect(`${CLIENT_URL}/dashboard`)
    } catch (err) {
      console.error('Error during authentication', err);
      res.status(500).send('Authentication failed');
    }
  })

  /* Github Auth */


  /* Logout */
  .get("/logout", (req, res) => {
    res.clearCookie("user")
    res.redirect("/")
  })

  /* Check auth for route protection */
  .get("/check-auth", (req, res) => {

    const userCookie = req.cookies.user

    if (userCookie) {
      const user = JSON.parse(userCookie)

      res.status(200).json({
        id: user?.id,
        username: user?.name
      })
    } else {
      res.json(null)
    }
  })

export default authRoutes