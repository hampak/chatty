import io from "socket.io-client"

const serverURL = import.meta.env.VITE_API_URL
const url = serverURL ? `${serverURL}` : "http://localhost:8000"

export const socket = io(url, {
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1500
})

// socket.on("connect", () => {
//   console.log("HI")
// })

// socket.on("userOnline", (userId) => {
//   console.log(userId)
// })


// // export let socket: Socket | null = null;

// // export const manageSocketConnection = (currentPath: string) => {
// //   const isEnabledPath = currentPath.startsWith("/dashboard");
// //   console.log(isEnabledPath)

// //   if (isEnabledPath && !socket) {
// //     console.log("called")
// //     socket = io(url, {
// //       withCredentials: true,
// //       autoConnect: true,
// //     });

// //     console.log(socket)
// //     socket.on("connect", () => {
// //       console.log("Socket connected:", socket?.id)
// //     })

// //     socket.on("disconnect", () => {
// //       console.log("Socket disconnected")
// //     })
// //   } else if (!isEnabledPath && socket) {
// //     socket.disconnect();
// //     socket = null
// //     console.log("Socket connection closed")
// //   }
// // }

// // export const socket = io(url, {
// //   withCredentials: true,
// //   autoConnect: true,
// // })