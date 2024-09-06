import { socket } from "@/utils/io";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useUser } from "../provider/UserProvider";
import { useQueryClient } from "@tanstack/react-query";

interface OnlineFriends {
  [userId: string]: "online" | "away"
}

interface SocketContextValue {
  socket: Socket;
  onlineFriends: OnlineFriends;
  currentStatus: "online" | "away" | undefined
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  const [onlineFriends, setOnlineFriends] = useState<OnlineFriends>({});
  const [currentStatus, setCurrentStatus] = useState<"online" | "away" | undefined>(undefined)
  const queryClient = useQueryClient()
  const { user } = useUser()


  useEffect(() => {
    if (user === null) return
    socket.emit("userOnline", user.id)

    // socket.on("getOnlineFriends", (online: { [userId: string]: "online" | "away" }, responseTime) => {
    socket.on("getOnlineFriends", async (online: { [userId: string]: "online" | "away" }) => {
      setOnlineFriends(online)
      console.log("onlineFriends", online)

      const userStatus = online[user.id]

      setCurrentStatus(userStatus)

      await queryClient.invalidateQueries({ queryKey: ["chat_list", user.id] })
    })

    return () => {
      socket.off("userOnline")
      socket.off("getOnlineFriends")
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineFriends, currentStatus }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};