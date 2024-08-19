import dotenv from "dotenv"
import express from "express"
import { OAuth2Client } from "google-auth-library"
import { User } from "../db/models"
import jwt, { JwtPayload } from 'jsonwebtoken';


dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const JWT_SECRET = process.env.JWT_SECRET

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)


const authRoutes = express.Router()

  /* Google auth */
  .get("/google", (req, res, next) => {

    const token = req.cookies.user

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
        if (typeof decoded !== "string" && decoded.user_id) {
          User.findById(decoded.user_id).then(user => {
            if (user) {
              return res.redirect(`${CLIENT_URL}/dashboard`)
            }
          })
        }
      } catch (error) {
        return next()
      }
    } else {
      res.header("Access-Control-Allow-Origin", CLIENT_URL);
      res.header("Access-Control-Allow-Credentials", 'true');
      res.header("Referrer-Policy", "no-referrer-when-downgrade");

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: 'https://www.googleapis.com/auth/userinfo.profile  openid ',
        prompt: "consent"
      })
      return res.redirect(authUrl)
    }
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

      const accessingUser = ticket.getPayload()

      // check to see if user already exists
      const user = await User.findOne({
        google_id: accessingUser?.sub
      })

      let token

      if (!user) {
        const newUser = new User({
          name: accessingUser?.name,
          email: accessingUser?.email,
          google_id: accessingUser?.sub,
          image: accessingUser?.picture
        })
        const savedUser = await newUser.save()

        token = jwt.sign({
          user_id: savedUser?._id,
          name: savedUser?.name,
          email: savedUser?.email,
          picture: savedUser?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )
      } else {
        token = jwt.sign({
          user_id: user?._id,
          name: user?.name,
          email: user?.email,
          picture: user?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )
      }

      res.cookie("user", token, {
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

    const token = req.cookies.user

    if (!token) {
      return res.redirect(`${CLIENT_URL}`)
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
      if (typeof decoded !== "string" && decoded.user_id) {
        User.findById(decoded.user_id).then(user => {
          if (user) {
            return res.status(200)
          } else {
            return res.redirect(`${CLIENT_URL}`)
          }
        })
      } else {
        return res.redirect(`${CLIENT_URL}`)
      }
    } catch (error) {
      return res.redirect(`${CLIENT_URL}`)
    }
  })

export default authRoutes