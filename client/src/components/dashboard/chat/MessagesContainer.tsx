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
    <div className="bg-blue-300s h-[93%] overflow-y-auto">
      {
        messageList.map((m, index) => (
          <div key={index} className={cn(m.senderId === user.id ? "flex flex-col items-end" : "flex items-start")}>
            {m.message}
          </div>
        ))
      }
    </div>
  )
}

export default MessagesContainer