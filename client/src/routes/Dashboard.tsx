import { useSocket } from "@/components/context/SocketContext"
import { useUser } from "@/components/context/UserProvider"
import { useEffect } from "react"

const Dashboard = () => {

  const { socket } = useSocket()
  const { user } = useUser()

  useEffect(() => {
    socket?.on("userConnect", async () => {

    })
  }, [socket])

  return (
    <div className="bg-blue-100s h-full w-full flex items-center justify-center">
      <span className="text-lg font-semibold">
        Hello :) Create or continue with a chat!
      </span>
    </div>
  )
}

export default Dashboard