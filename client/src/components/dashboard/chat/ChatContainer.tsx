import { useCurrentRoute } from "@/components/provider/RouteProvider"
import { cn } from "@/lib/utils"
import { Chat } from "@/types"
import { useSidebarStore } from "@/utils/zustand"
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
  },
  chatroomId: string | undefined,
}

const ChatContainer = ({ data, user }: ChatContainerProps) => {

  const { isConnected } = useCurrentRoute()
  const { isOpen } = useSidebarStore()

  return (
    <div className={cn("bg-red-500s h-[calc(100%-40px)] py-2", isOpen ? "" : "h-[calc(100vh-97px)]")}>
      <MessagesContainer user={user} messages={data.messages} />
      <MessageInput isConnected={isConnected} chatroomId={data.chatroomId} user={user} participants={data.participantsId} />
    </div>
  )
}

export default ChatContainer