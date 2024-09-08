export type User = {
  id: string,
  name: string,
  online: boolean,
  picture: string,
  userTag: string
}

export type ChatList = {
  id: string,
  title: string,
  participants: string[],
  createdAt: Date,
  updatedAt: Date,
  image: string
}[]

export type Chat = {
  chatroomId: string,
  title: string,
  participants: string[],
  createdAt: string,
  messages: {
    message: string,
    senderId: string,
    timestamp: number
  }[]
}