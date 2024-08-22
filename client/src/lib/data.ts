import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChatList } from "../types";

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