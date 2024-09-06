import { cn } from "@/lib/utils"
import { socket } from "@/utils/io"
import { useEffect, useState } from "react"

interface MessagesContainerProps {
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  },
  messages: {
    message: string,
    senderId: string,
    timestamp: string
  }[]
}

interface Message {
  message: string;
  senderId: string;
  timestamp: string
}

const MessagesContainer = ({ user, messages }: MessagesContainerProps) => {

  const [messageList, setMessageList] = useState<Message[]>([])

  console.log(messages)

  useEffect(() => {
    setMessageList(messages)
  }, [messages])

  useEffect(() => {
    socket.on("message", async (message, senderId, timestamp) => {
      const newMessage: Message = { message, senderId, timestamp }
      setMessageList((prevState) => [...prevState, newMessage])
    })
  }, [])

  return (
    <div className="bg-blue-300s h-[93%] overflow-y-auto w-full">
      {
        messageList.map((m, index) => (
          <div key={index} className={cn("mb-1.5", m.senderId === user.id ? "flex flex-col items-end" : "flex items-start")}>
            <p className={cn("py-1 px-2 rounded-lg", m.senderId === user.id ? "bg-blue-500 text-white" : "bg-gray-200")}>{m.message}</p>
          </div>
        ))
      }
    </div>
  )
}

export default MessagesContainer