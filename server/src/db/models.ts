import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false
  },
  online: {
    type: Boolean,
    default: false
  },
  google_id: {
    type: String,
    required: false
  },
  github_id: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})


const User = mongoose.model("User", userSchema)

export {
  User
}