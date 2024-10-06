import { Chat } from "@/types"
import { socket } from "@/utils/io"
import { useEffect, useRef, useState } from "react"
import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"
import { useSidebarStore } from "@/utils/zustand"
import { cn } from "@/lib/utils"

interface ChatContainerProps {
  data: Chat,
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  },
  chatroomId: string | undefined,
  location: any
}

const ChatContainer = ({ data, user, chatroomId, location }: ChatContainerProps) => {

  // const { chatroomId } = data
  const [isConnected, setIsConnected] = useState(false)

  const previousChatroomId = useRef<string | undefined>(undefined)

  useEffect(() => {

    console.log("previousChatroomId", previousChatroomId)
    console.log("chatroomId", chatroomId)

    if (previousChatroomId.current !== chatroomId) {
      socket.emit("leaveChatroom", previousChatroomId, user.id)
    }

    socket.emit("connectedToRoom", chatroomId, user.id)

    socket.on("joinedChatroom", () => {
      setIsConnected(true)
      previousChatroomId.current = chatroomId
    })


    return () => {
      socket.off("joined-chatroom")
      socket.off("connectedToRoom")
    }
  }, [chatroomId, user.id, location])

  const { isOpen } = useSidebarStore()

  return (
    <div className={cn("bg-red-500s h-[calc(100%-40px)] py-2", isOpen ? "" : "h-[calc(100vh-97px)]")}>
      <MessagesContainer user={user} messages={data.messages} />
      <MessageInput isConnected={isConnected} chatroomId={data.chatroomId} user={user} participants={data.participantsId} />
    </div>
  )
}

export default ChatContainer