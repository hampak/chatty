// import io, { Socket } from "socket.io-client"

// const serverURL = import.meta.env.VITE_API_URL
// const url = serverURL ? `${serverURL}` : "http://localhost:8000"
// let socket: Socket | null = null

// // export const socket = io("http://localhost:8000", {
// //   withCredentials: true,
// //   autoConnect: false
// // })

// export const initializeSocket = () => {
//   if (!socket) {
//     socket = io(url, {
//       withCredentials: true,
//       autoConnect: false
//     })
//   }

//   return socket
// }

// export const connectSocket = () => {
//   if (socket && !socket.connected) {
//     socket.connect()
//   }
// }

// export const disconnectSocket = () => {
//   if (socket && socket.connected) {
//     socket.disconnect()
//   }
// }