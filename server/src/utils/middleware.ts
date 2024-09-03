import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models";
import { redis } from "../db/redis";

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

const checkAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
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
        return next()
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


  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload
  //   if (typeof decoded !== "string" && decoded.user_id) {
  //     await User.findById(decoded.user_id).then(user => {
  //       if (user) {
  //         return next()
  //       } else {
  //         return res.status(401).json({
  //           message: "User not found, please log in"
  //         })
  //       }
  //     })
  //   } else {
  //     return res.status(401).json({
  //       message: "Invalid token, please log in"
  //     })
  //   }
  // } catch (error) {
  //   return res.status(401).json({
  //     message: "Invalid token / token doesn't exist"
  //   })
  // }
}

export {
  checkAuthStatus
};

