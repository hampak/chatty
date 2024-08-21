import { z } from "zod"

const addFriendSchema = z.object({
  friendUserTag: z.string().min(1, {
    message: "Please enter a user tag"
  })
})

export {
  addFriendSchema
}