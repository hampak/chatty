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
  title: string,
  participants: string[],
  createdAt: string
}