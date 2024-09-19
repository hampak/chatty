import { useEffect, useState } from "react"
import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"
import { socket } from "@/utils/io"
import { Chat } from "@/types"

interface ChatContainerProps {
  data: Chat,
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  }
}

const ChatContainer = ({ data, user }: ChatContainerProps) => {

  const [isConnected, setIsConnected] = useState(false)

  const { chatroomId } = data

  useEffect(() => {
    socket.emit("connected-to-room", chatroomId, user.id)

    socket.on("joined-chatroom", () => {
      setIsConnected(true)
    })

    return (() => {
      socket.off("joined-chatroom")
      socket.off("connected-to-room")
      socket.emit("leave-chatroom", chatroomId, user.id)
    })
  }, [chatroomId, user.id])

  return (
    <div className="bg-red-200s h-[calc(100%-40px)] py-2">
      <MessagesContainer user={user} messages={data.messages} />
      <MessageInput isConnected={isConnected} chatroomId={data.chatroomId} user={user} participants={data.participantsId} />
    </div>
  )
}

export default ChatContainer