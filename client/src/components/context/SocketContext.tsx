import { socket } from "@/utils/io";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useUser } from "./UserProvider";

interface SocketContextValue {
  socket: Socket;
  onlineFriends: string[]
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {

  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);
  const { user } = useUser()

  useEffect(() => {
    if (user === null) return
    socket.emit("userOnline", user.id)

    socket.on("getOnlineFriends", (online) => {
      // console.log(online)
      setOnlineFriends(online)
    })

    // socket.on("user-offline", (userId) => {
    //   setOnlineFriends(prev => prev.filter(friendId => friendId !== userId))
    // })

    // socket.on("message", (message) => {
    //   console.log()
    // })

    return () => {
      socket.off("userOnline")
      socket.off("getOnlineFriends")
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