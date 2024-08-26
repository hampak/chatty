import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import { useUser } from "./UserProvider";

interface SocketContextValue {
  socket: Socket | null;
  onlineFriends: Set<string>
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

const serverURL = import.meta.env.VITE_API_URL
const url = serverURL ? `${serverURL}` : "http://localhost:8000"

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set())

  const { user } = useUser()

  // const handleUserOnline = useCallback(({ userId }: { userId: string }) => {
  //   setOnlineFriends((prev) => {
  //     if (prev.has(userId) || userId === user?.id) {
  //       return prev
  //     }
  //     return new Set([...prev, userId])
  //   })
  // }, [user?.id])

  // const handleUserOffline = useCallback(({ userId }: { userId: string }) => {
  //   setOnlineFriends((prev) => {
  //     const updatedFriends = new Set(prev);
  //     updatedFriends.delete(userId);
  //     return updatedFriends;
  //   });
  // }, []);

  useEffect(() => {
    // if (user) {
    //   const newSocket = io(url, {
    //     withCredentials: true,
    //     autoConnect: true,
    //     query: {
    //       userId: user.id
    //     }
    //   })
    //   setSocket(newSocket)

    //   // newSocket.on("userOnline", ({ userId }) => {
    //   //   setOnlineFriends((prev) => {
    //   //     if (prev.has(userId)) {
    //   //       return prev
    //   //     }

    //   //     if (userId === user.id) {
    //   //       return prev
    //   //     }

    //   //     return new Set([...prev, userId])
    //   //   })
    //   // })

    //   // newSocket.on("userOnline", handleUserOnline)
    //   // newSocket.on("userOffline", handleUserOffline)

    //   // console.log(onlineFriends)

    //   // newSocket.on("connect", () => {
    //   //   console.log("Socket connected on client", newSocket.id)
    //   // })
    //   // return () => {
    //   //   newSocket.disconnect();
    //   //   console.log('Socket DISCONNECTED on client', newSocket.id);
    //   // };
    // }
    const newSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
      query: {
        userId: user?.id
      }
    })
    setSocket(newSocket)
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