import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useGetChatsList(userId?: string) {
  const queryClient = useQueryClient()

  queryClient.invalidateQueries({
    queryKey: ["chat_list"]
  })

  return useQuery({
    queryKey: ["chat_list"],
    queryFn: async () => axios.get("/api/chat/chat-list", {
      params: {
        userId
      }
    }),
    refetchOnWindowFocus: false,

  })
}