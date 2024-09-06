import { useEffect, useState } from "react"
import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"
import { socket } from "@/utils/io"

interface ChatContainerProps {
  data: {
    chatroomId: string,
    title: string,
    participants: string[],
    createdAt: string
  }
}

const ChatContainer = ({ data }: ChatContainerProps) => {

  const [isConnected, setIsConnected] = useState(false)

  const { chatroomId } = data

  useEffect(() => {
    socket.emit("connected-to-room", chatroomId)

    socket.on("joined-chatroom", (message) => {
      setIsConnected(true)
      console.log(message)
    })
  }, [chatroomId])

  console.log("data", data)

  return (
    <div className="bg-red-200s h-[calc(100%-40px)] py-2">
      <MessagesContainer />
      <MessageInput isConnected={isConnected} chatroomId={data.chatroomId} />
    </div>
  )
}

export default ChatContainer