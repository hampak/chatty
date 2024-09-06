import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Chat, ChatList } from "../types";
import { toast } from "sonner";

const serverURL = import.meta.env.VITE_API_URL


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
        const response = await axios.get<ChatList>(serverURL ? `${serverURL}/api/chat/chat-list` : "/api/chat/chat-list", {
          params: {
            userId
          },
          withCredentials: true
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
    refetchOnWindowFocus: false
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
        const response = await axios.get<Chat>(serverURL ? `${serverURL}/api/chat/chat-info` : "/api/chat/chat-info", {
          params: {
            chatId,
            userId
          },
          withCredentials: true
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


interface ServerResponse {
  friendUserTag: string;
  friendId: string;
}

export function useCreateChat() {

  return useMutation<ServerResponse, Error, CreateChat>({
    mutationKey: ["create_chat"],
    mutationFn: async ({
      userId,
      userName,
      userTag,
      userImage,
      friendUserTag
    }: CreateChat) => {
      const response = await axios.post(serverURL ? `${serverURL}/api/chat/add-friend` : "/api/chat/add-friend", {
        userId,
        userName,
        userTag,
        userImage,
        friendUserTag
      },
        {
          withCredentials: true
        }
      )
      return response.data
    }
  })
}