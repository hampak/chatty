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
  userIdArray: z.string().array()
})

export {
  addFriendSchema,
  messageSchema,
  startChatWithFriendSchema
}