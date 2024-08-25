import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Chat, ChatList } from "../types";


type GetChats = {
  userId?: string
}

type GetChatInfo = {
  chatId?: string,
  userId?: string
}

type CreateChat = {
  userId?: string,
  userName?: string,
  userTag?: string,
  userImage?: string,
  friendUserTag?: string,
}

export function useGetChatsList({ userId }: GetChats) {

  return useQuery({
    queryKey: ["chat_list", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required")
      }
      const response = await axios.get<ChatList>("/api/chat/chat-list", {
        params: {
          userId
        }
      })
      return response.data
    },
    refetchOnWindowFocus: false,
    enabled: !!userId
  })
}


export function useGetChatInfo({ chatId, userId }: GetChatInfo) {
  return useQuery({
    queryKey: ["chat_list", chatId],
    queryFn: async () => {
      if (!chatId && !userId) {
        throw new Error("User ID is required")
      }
      const response = await axios.get<Chat>("/api/chat/chat-info", {
        params: {
          chatId,
          userId
        }
      })
      return response.data
    },
    refetchOnWindowFocus: false,
    enabled: !!chatId && !!userId
  })
}


export function useCreateChat() {

  return useMutation({
    mutationKey: ["create_chat"],
    mutationFn: async ({
      userId,
      userName,
      userTag,
      userImage,
      friendUserTag
    }: CreateChat) => {
      await axios.post('/api/chat/add-friend', {
        userId,
        userName,
        userTag,
        userImage,
        friendUserTag
      })
    }
  })
}