// import { socket } from "@/utils/io";
// import { createContext, useContext, useEffect, useState } from "react";
// import { Socket } from "socket.io-client";

// interface SocketContextValue {
//   socket: Socket
// }

// const SocketContext = createContext<SocketContextValue>({ socket })

// // const serverURL = import.meta.env.VITE_API_URL
// // const url = serverURL ? `${serverURL}` : "http://localhost:8000"

// export const SocketProvider = ({
//   children
// }: {
//   children: React.ReactNode
// }) => {

//   const [newSocket, setNewSocket] = useState<Socket | null>(null)

//   useEffect(() => {

//     setNewSocket(socket)


//     return () => {
//       socket.disconnect()
//     }
//   }, [])


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