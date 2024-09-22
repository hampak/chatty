import { Chat } from "@/types"
import { socket } from "@/utils/io"
import { useEffect, useState } from "react"
import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"

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

  // const previousChatroomId = useRef<string | null>(null)

  useEffect(() => {

    socket.emit("connected-to-room", chatroomId, user.id)

    socket.on("joined-chatroom", () => {
      setIsConnected(true)
    })

    return () => {
      socket.off("joined-chatroom")
      socket.off("connected-to-room")
    }
  }, [chatroomId, user.id])

  // useEffect(() => {

  //   if (previousChatroomId.current && previousChatroomId.current !== chatroomId) {
  //     console.log("Leaving previous room:", previousChatroomId.current);
  //     socket.emit("leave-chatroom", previousChatroomId, user.id)
  //   }

  //   socket.emit("connected-to-room", chatroomId, user.id)

  //   socket.on("joined-chatroom", () => {
  //     setIsConnected(true)
  //   })

  //   previousChatroomId.current = chatroomId

  //   return () => {
  //     socket.off("leave-chatroom")
  //     socket.off("joined-chatroom")
  //     socket.off("connected-to-room")
  //   }
  // }, [chatroomId, user.id])

  return (
    <div className="bg-red-200s h-[calc(100%-40px)] py-2">
      <MessagesContainer user={user} messages={data.messages} />
      <MessageInput isConnected={isConnected} chatroomId={data.chatroomId} user={user} participants={data.participantsId} />
    </div>
  )
}

export default ChatContainer