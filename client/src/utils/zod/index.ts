import { z } from "zod"

const addFriendSchema = z.object({
  friendUserTag: z.string().min(1, {
    message: "Please enter a user tag"
  })
})

const messageSchema = z.object({
  message: z.string().min(1, {
    message: "Please enter a message"
  })
})

const startChatWithFriendSchema = z.object({
  friendData: z.array(
    z.object({
      friendId: z.string(),
      friendPicture: z.string(),
      friendName: z.string()
    })
  )
})

export {
  addFriendSchema,
  messageSchema,
  startChatWithFriendSchema
}