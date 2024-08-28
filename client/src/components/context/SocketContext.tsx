import { socket } from "@/utils/io";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useUser } from "./UserProvider";

interface OnlineFriend {
  userId: string
}

interface SocketContextValue {
  socket: Socket;
  onlineFriends: OnlineFriend[]
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const { user } = useUser()

  useEffect(() => {
    if (user === null) return
    socket.emit("userOnline", user.id)
    // socket.on("userOffline", (userId: string) => {
    //   setOnlineFriends(prev => prev.filter(friend => friend.userId !== userId))
    // })

    return () => {
      socket.off("userOnline")
      // socket.off("userOffline")
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineFriends }}>
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