import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Chat, ChatList } from "../types";

export function useGetChatsList(userId?: string) {

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
  })
}


export function useGetChatInfo(chatId?: string, userId?: string) {
  return useQuery({
    queryKey: ["chat_list", chatId],
    queryFn: async () => {
      if (!chatId || !userId) {
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
  })
}