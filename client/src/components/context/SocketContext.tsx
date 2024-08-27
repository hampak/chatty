import { socket } from "@/utils/io";
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

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


  useEffect(() => {
    socket.on("userOnline", (userId: string) => {
      console.log(userId)
      setOnlineFriends(prev => {
        // if (!prev.includes(userId)) {
        //   return [...prev, userId]
        // }
        // return prev
        // const updatedSet = new Set(prev)
        // updatedSet.add(userId)
        // return Array.from(updatedSet)
        const existing = prev.some(friend => friend.userId === userId);
        if (!existing) {
          return [...prev, { userId }]
        }
        return prev
      })
    })

    socket.on("userOffline", (userId: string) => {
      setOnlineFriends(prev => prev.filter(friend => friend.userId !== userId))
    })

    return () => {
      socket.off("userOnline")
      socket.off("userOffline")
    }
  }, [])

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