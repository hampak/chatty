import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from "../db/models";
import { redis } from "../db/redis";


dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const JWT_SECRET = process.env.JWT_SECRET

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)


const authRoutes = express.Router()

  /* Google auth */
  .get("/google", (req, res) => {

    const token = req.cookies.user

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
        if (typeof decoded !== "string" && decoded.user_id) {
          User.findById(decoded.user_id).then(user => {
            if (user) {
              return res.redirect(`${CLIENT_URL}/dashboard`)
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
      } catch (error) {
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

      // console.log("accessingUser", accessingUser)

      // check to see if user already exists
      const user = await User.findOne({
        google_id: accessingUser?.sub
      })

      let token

      const fullUUID = crypto.randomUUID()
      const tag = fullUUID.slice(0, 5)
      const userTag = `${accessingUser?.name}#${tag}`

      if (!user) {
        const newUser = new User({
          name: accessingUser?.name,
          google_id: accessingUser?.sub,
          image: accessingUser?.picture,
          userTag
        })
        const savedUser = await newUser.save()

        token = jwt.sign({
          user_id: savedUser?._id,
          name: savedUser?.name,
          picture: savedUser?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )
      } else {
        token = jwt.sign({
          user_id: user?._id,
          name: user?.name,
          picture: user?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )
      }

      res.cookie("user", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 30 * 60 * 1000,
        sameSite: "none"
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      })

      res.redirect(`${CLIENT_URL}/dashboard`)
    } catch (err) {
      console.error('Error during authentication', err);
      res.status(500).send('Authentication failed');
    }
  })

  /* Github Auth */


  /* Logout */
  .get("/logout", async (req, res) => {
    const token = await req.cookies.user
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
    res.clearCookie("user")
    // await redis.srem("online-users", decoded.user_id)
    res.redirect("/")
  })

  /* Check auth for route protection */
  .get("/check-auth", async (req, res) => {

    // testing for production
    const token = await req.cookies.user
    // console.log("token", token)

    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
      // console.log("decoded", decoded)
      if (typeof decoded !== "string" && decoded.user_id) {
        await User.findById(decoded.user_id).then(user => {
          if (user) {
            return res.status(200).json({
              message: "Authenticated"
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

export default authRoutes