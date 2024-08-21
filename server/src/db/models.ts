import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  userTag: {
    type: String,
    required: true,
    unique: true
  },
  online: {
    type: Boolean,
    default: false
  },
  google_id: {
    type: String,
    required: false,
    unique: true
  },
  github_id: {
    type: String,
    required: false,
    unique: true
  },
  image: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

const chatRoomSchema = new mongoose.Schema({
  room_title: {
    type: String,
    required: true
  },
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  }],
  last_message: {
    type: mongoose.Schema.ObjectId,
    ref: "Chat"
  }
}, {
  timestamps: true
})

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  user: {
    id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    chatRoom: {
      type: mongoose.Schema.ObjectId,
      ref: "ChatRoom",
      required: true
    }
  }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema)
const Chat = mongoose.model("Chat", chatSchema)

export {
  User,
  ChatRoom,
  Chat
}