import dotenv from "dotenv"
import express from "express"
import { ChatRoom, User } from "../db/models"
import { redis } from "../db/redis"
import { checkAuthStatus } from "../utils/middleware"
import mongoose from "mongoose"

dotenv.config()

type Friend = {
  friendId: string;
  friendName: string;
  friendPicture: string
}

const CLIENT_URL = process.env.CLIENT_URL

const chatRoutes = express.Router()
  .post("/create-chat", checkAuthStatus, async (req, res) => {

    const { friendData, currentUserId, currentUserName, currentUserPicture } = await req.body

    try {
      // when client sends a request without selecting any friends
      if (friendData.length === 0) {
        return res.status(400).json({
          message: "Please choose at least one friend to start a chat with!"
        })
      }

      // when creating a 1 on 1 chat
      if (friendData.length === 1) {
        const chatroomAlreadyExists = await ChatRoom.findOne({
          participants: {
            $all: [
              { $elemMatch: { participantId: friendData[0].friendId } },
              { $elemMatch: { participantId: currentUserId } }
            ]
          },
          $expr: { $eq: [{ $size: "$participants" }, 2] }
        })

        if (chatroomAlreadyExists) {
          return res.redirect(`CLIENT_URL/dashboard/chat/${chatroomAlreadyExists._id}`)
        }

        const chatRoom = new ChatRoom({
          room_title: `${currentUserName}, ${friendData[0].friendName}`,
          participants: [
            { participantId: currentUserId, participantPicture: currentUserPicture },
            { participantId: friendData[0].friendId, participantPicture: friendData[0].friendPicture }
          ]
        })

        await chatRoom.save()

        // console.log("chatRoom", chatRoom)

        return res.status(200).json({
          message: `Created a chatroom with ${friendData[0].friendName}`
        })
      }

      // when creating a group chat
      if (friendData.length > 1) {

        const userNames = friendData.map((friend: Friend) => friend.friendName)
        const roomTitle = `${currentUserName}, ${userNames.join(", ")}`

        const participants = [
          { participantId: currentUserId, participantPicture: currentUserPicture },
          ...friendData.map((friend: Friend) => ({
            participantId: friend.friendId,
            participantPicture: friend.friendPicture
          }))
        ]

        const chatRoom = new ChatRoom({
          room_title: roomTitle,
          participants: participants,
        })

        await chatRoom.save()

        return res.status(200).json({
          message: `Created a group chat with ${userNames.length} friends!`,
          chatroomId: chatRoom._id
        })
      }


    } catch (error) {
      return res.status(400).json({
        message: "Internal server error"
      })
    }
  })

  .get("/chat-list", checkAuthStatus, async (req, res) => {
    const { userId } = await req.query
    const currentUserId = userId?.toString()

    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Unauthenticated, please login first"
      })
    }

    const { name } = user

    try {
      const data = await ChatRoom.find({
        participants: { $elemMatch: { participantId: userId } }
      })

      const chatRooms = await Promise.all(data.map(async room => {

        let lastMessage
        let chatRoomId = room._id

        const lastMessageRaw = await redis.zrange(`messages-${room._id}`, -1, -1)

        lastMessage = lastMessageRaw[0] ? JSON.parse(lastMessageRaw[0]) : ""

        const allParticipants = room.room_title.split("|").map(p => p.trim())
        const friendName = allParticipants.find(p => p !== name)

        const lastSeenTimestamp = await redis.get(`last_seen-${userId}-${chatRoomId}`)

        let unreadMessagesCount = 0;

        if (!lastSeenTimestamp) {
          const allMessages = await redis.zrange(`messages-${chatRoomId}`, 0, -1);
          const unreadMessages = allMessages.filter(message => {
            const parsedMessage = JSON.parse(message)
            return parsedMessage.senderId !== currentUserId
          })
          unreadMessagesCount = unreadMessages.length;
        } else {
          const messagesAfterLastSeen = await redis.zrangebyscore(`messages-${chatRoomId}`, lastSeenTimestamp, "+inf")
          const unreadMessages = messagesAfterLastSeen.filter(message => {
            const parsedMessage = JSON.parse(message);
            return parsedMessage.senderId !== currentUserId
          })
          unreadMessagesCount = unreadMessages.length
        }

        return {
          id: room._id,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          title: friendName,
          participants: room.participants,
          lastMessage: lastMessage.message,
          unreadMessagesCount
        }
      }))
      // console.log("chat-rooms", chatRooms)
      res.status(200).json(chatRooms)
    } catch (error) {
      res.status(400).json({
        message: "Error while querying your list of messages"
      })
    }
  })

  .get("/chat-info", checkAuthStatus, async (req, res) => {
    const { chatId, userId } = req.query

    if (!chatId) return res.status(404)

    if (!mongoose.Types.ObjectId.isValid(chatId.toString())) {
      return res.status(400).json({
        message: "Invalid chat room ID"
      })
    }

    const chatRoomInfo = await ChatRoom.findById(chatId)
    const user = await User.findById(userId)

    if (!user) {
      return res.status(401).json({
        message: "Session expired. Redirecting to login."
      })
    }

    if (!chatRoomInfo) {
      return res.status(404).json({
        message: "Chatroom not found :/"
      })
    }

    const isParticipant = chatRoomInfo.participants.some(participant =>
      participant.participantId.toString() === user._id.toString()
    )

    if (!isParticipant) {
      return res.status(403).json({
        message: "You're not part of this chat :("
      })
    }

    const rawMessages = await redis.zrange(`messages-${chatId}`, 0, -1, "WITHSCORES")
    const messages = []
    for (let i = 0; i < rawMessages.length; i += 2) {
      const messageJson = rawMessages[i]
      const timestamp = rawMessages[i + 1]
      if (messageJson && timestamp) {
        const message = JSON.parse(messageJson!)
        message.timeStamp = parseInt(timestamp!, 10)
        messages.push(message)
      }
    }

    const { name } = user
    const { room_title, createdAt, _id } = chatRoomInfo

    const allParticipants = room_title.split("|").map(p => p.trim())
    const friendName = allParticipants.find(p => p !== name)

    const participantsId = chatRoomInfo.participants.map(p => p.participantId)

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    const date = new Date(createdAt)
    const formattedDate = date.toLocaleString(undefined, options)

    console.log("messages", messages)

    return res.status(200).json({
      chatroomId: _id,
      title: friendName,
      participants: allParticipants,
      participantsId,
      createdAt: formattedDate,
      messages
    })
  })

export default chatRoutes