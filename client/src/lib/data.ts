import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Chat, ChatList, FriendsList } from "../types";

const serverURL = import.meta.env.VITE_API_URL


type GetChats = {
  userId?: string
}

type GetChatInfo = {
  chatId?: string,
  userId?: string
}

type CreateChat = {
  friendData: {
    friendId: string,
    friendPicture: string
  }[],
  currentUserId: string,
  currentUserName: string,
  currentUserPicture: string,
}

type User = {
  userId: string,
  name: string,
  online: boolean,
  picture: string,
  userTag: string
}

type AddFriend = {
  userId?: string,
  friendUserTag: string
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

export function useGetFriendsList({ userId }: { userId?: string }) {
  return useQuery({
    queryKey: ["friend_list", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required")
      }

      try {
        const response = await axios.get<FriendsList>(serverURL ? `${serverURL}/api/friend` : "/api/friend", {
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
  message: string
}

export function useAddFriend() {
  return useMutation({
    mutationKey: ["add-friend"],
    mutationFn: async ({
      userId,
      friendUserTag
    }: AddFriend) => {
      const response = await axios.post(serverURL ? `${serverURL}/api/friend/add-friend` : "/api/friend/add-friend", {
        userId,
        friendUserTag
      }, {
        withCredentials: true
      })
      return response.data
    }
  })
}

export function useCreateChat() {

  return useMutation<ServerResponse, Error, CreateChat>({
    mutationKey: ["create_chat"],
    mutationFn: async ({
      friendData,
      currentUserId,
      currentUserName,
      currentUserPicture
    }: CreateChat) => {
      const response = await axios.post(serverURL ? `${serverURL}/api/chat/create-chat` : "/api/chat/create-chat", {
        friendData,
        currentUserId,
        currentUserName,
        currentUserPicture
      },
        {
          withCredentials: true
        }
      )
      return response.data
    }
  })
}