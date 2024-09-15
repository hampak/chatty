import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from "../db/models";
import { redis } from "../db/redis";
import axios from "axios";


dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

const JWT_SECRET = process.env.JWT_SECRET

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)


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
              res.header("Access-Control-Allow-Origin", `${CLIENT_URL}`);
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
          res.header("Access-Control-Allow-Origin", `${CLIENT_URL}`);
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
        res.header("Access-Control-Allow-Origin", `${CLIENT_URL}`);
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
      res.header("Access-Control-Allow-Origin", `${CLIENT_URL}`);
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

      const fullUUID = crypto.randomUUID()
      const tag = fullUUID.slice(0, 5)
      const userTag = `${accessingUser?.name}#${tag}`

      if (!user) {
        const newUser = new User({
          name: accessingUser?.name,
          google_id: accessingUser?.sub,
          github_id: "",
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

        await redis.set(`sessionToken-${savedUser._id.toString()}`, token, "EX", 1800)
      } else {
        token = jwt.sign({
          user_id: user?._id,
          name: user?.name,
          picture: user?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )

        redis.set(`sessionToken-${user._id.toString()}`, token, "EX", 1800)
      }

      res.cookie("user", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 30 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      })

      res.redirect(`${CLIENT_URL}/dashboard`)
    } catch (err) {
      console.error('Error during authentication', err);
      res.status(500).send('Authentication failed');
    }
  })

  /* Github Auth */

  .get("/github", async (req, res) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=http://localhost:8000/api/auth/github/callback&scope=user`

    res.redirect(redirectUrl)
  })

  .get("/github/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("No code provided")
    }

    try {
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code
        },
        {
          headers: {
            accept: "application/json"
          }
        }
      )

      const accessToken = tokenResponse.data.access_token

      const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const { avatar_url, name, id } = userResponse.data

      // check to see if user already exists
      const user = await User.findOne({
        github_id: id
      })

      let token

      const fullUUID = crypto.randomUUID()
      const tag = fullUUID.slice(0, 5)
      const userTag = `${name}#${tag}`

      if (!user) {
        const newUser = new User({
          name: name,
          github_id: id,
          google_id: "",
          image: avatar_url,
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

        await redis.set(`sessionToken-${savedUser._id.toString()}`, token, "EX", 1800)
      } else {
        token = jwt.sign({
          user_id: user?._id,
          name: user?.name,
          picture: user?.image
        },
          JWT_SECRET!,
          { expiresIn: "30m" }
        )

        redis.set(`sessionToken-${user._id.toString()}`, token, "EX", 1800)
      }

      res.cookie("user", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        maxAge: 30 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
      })

      res.redirect(`${CLIENT_URL}/dashboard`)
    } catch (err) {
      console.error('Error during authentication', err);
      res.status(500).send('Authentication failed');
    }
  })


  /* Logout */
  .get("/logout", async (req, res) => {
    const token = await req.cookies.user
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload

    res.clearCookie("user")
    await redis.del(`sessionToken-${decoded.user_id}`)
    res.redirect(`${CLIENT_URL}`)
  })

  /* Check auth for route protection */
  .get("/check-auth", async (req, res) => {
    const token = await req.cookies.user

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, please login"
      })
    }


    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
      if (typeof decoded !== "string" && decoded.user_id) {
        const isUserLoggedIn = await redis.get(`sessionToken-${decoded.user_id}`)
        if (isUserLoggedIn) {
          return res.status(200).json({
            message: "Authenticated"
          })
        } else if (isUserLoggedIn === null) {
          return res.status(401).json({
            message: "User not found, please log in"
          })
        }
      } else {
        return res.status(401).json({
          message: "Invalid token, please log in"
        })
      }
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token / token doesn't exist"
      })
    }
  })

export default authRoutes