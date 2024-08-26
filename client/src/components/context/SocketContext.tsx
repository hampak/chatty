import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  // isConnected: boolean
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

  useEffect(() => {
    const newSocket = io(url, {
      withCredentials: true,
      autoConnect: true,
      query: {
        userId: user?.id
      }
    })

    setSocket(newSocket)


    return () => {
      newSocket.disconnect()
    }
  }, [])


  return (
    <SocketContext.Provider value={{ socket }}>
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

// import { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from 'socket.io-client';
// import { useUser } from "./UserProvider";

// interface SocketContextValue {
//   socket: Socket | null;
//   // onlineFriends: Set<string>
// }

// const SocketContext = createContext<SocketContextValue | undefined>(undefined)

// const serverURL = import.meta.env.VITE_API_URL
// const url = serverURL ? `${serverURL}` : "http://localhost:8000"

// export const SocketProvider = ({
//   children
// }: {
//   children: React.ReactNode
// }) => {
//   const [socket, setSocket] = useState<Socket | null>(null)
//   const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set())

//   const { user } = useUser()

//   useEffect(() => {
//     if (user) {
//       const newSocket = io(url, {
//         withCredentials: true,
//         autoConnect: !!user,
//         query: {
//           userId: user?.id
//         }
//       })
//       setSocket(newSocket)

//       // newSocket.on("connect", () => {
//       //   console.log("Socket connected", newSocket.id)
//       // })

//       // newSocket.on("disconnect", () => {
//       //   console.log("Socket disconnect", newSocket.id)
//       // })

//       // return () => {
//       //   newSocket.disconnect()
//       //   setSocket(null)
//       // }
//     }
//   }, [user])

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   )
// }

// export const useSocket = (): SocketContextValue => {
//   const context = useContext(SocketContext);
//   if (context === undefined) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };