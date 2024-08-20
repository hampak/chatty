import { z } from "zod"

const addFriendSchema = z.object({
  userTag: z.string().min(1, {
    message: "Please enter a user tag"
  })
})

export {
  addFriendSchema
}