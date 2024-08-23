export type User = {
  id: string,
  name: string,
  email: string,
  online: boolean,
  picture: string,
  userTag: string
}

export type ChatList = {
  id: string,
  title: string,
  paticipants: string[],
  createdAt: Date,
  updatedAt: Date,
  image: string
}[]

export type Chat = {
  title: string
}