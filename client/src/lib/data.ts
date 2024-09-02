import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Chat, ChatList } from "../types";
import { toast } from "sonner";


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

type User = {
  userId: string,
  name: string,
  online: boolean,
  picture: string,
  userTag: string
}


export function useGetUser() {
  return useQuery({
    queryKey: ["get_user"],
    queryFn: async () => {
      const response = await axios.get<User>("/api/chat/chat-list")

      return response.data
    },
    refetchOnWindowFocus: false
  })
}

export function useGetChatsList({ userId }: GetChats) {

  return useQuery({
    queryKey: ["chat_list", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required")
      }
      try {
        const response = await axios.get<ChatList>("/api/chat/chat-list", {
          params: {
            userId
          }
        })
        return response.data
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(`${error.response?.data.message}`)
          setTimeout(() => window.location.href = "/login", 1200)
        }
        return null
      }
    },
    refetchOnWindowFocus: false,
    // enabled: !!userId
  })
}


export function useGetChatInfo({ chatId, userId }: GetChatInfo) {
  return useQuery({
    queryKey: ["chat_info", chatId],
    queryFn: async () => {
      if (!chatId && !userId) {
        throw new Error("User ID is required")
      }
      try {
        const response = await axios.get<Chat>("/api/chat/chat-info", {
          params: {
            chatId,
            userId
          }
        })
        return response.data
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(`${error.response?.data.message}`)
          setTimeout(() => window.location.href = "/login", 1200)
        }
        return null
      }
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