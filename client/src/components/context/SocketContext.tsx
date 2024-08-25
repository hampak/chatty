import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null)

const serverURL = import.meta.env.VITE_API_URL
const url = serverURL ? `${serverURL}` : "http://localhost:8000"

export const SocketProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io(url, {
      withCredentials: true
    })

    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Socket connected on client", newSocket.id)
    })

    return () => {
      newSocket.disconnect();
      console.log('Socket DISCONNECTED on client', newSocket.id);
    };
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};