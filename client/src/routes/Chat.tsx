import ChatContainer from "@/components/dashboard/chat/ChatContainer"
import { Loader2 } from "lucide-react"
import { useParams } from "react-router-dom"
import ChatHeader from "../components/dashboard/chat/ChatHeader"
import { useUser } from "../components/provider/UserProvider"
import { useGetChatInfo } from "../lib/data"

const Chat = () => {

  const { chatId } = useParams()
  const { user } = useUser()

  const { data } = useGetChatInfo({ chatId: chatId, userId: user?.id })
  if (!data || !user) {
    return (
      <div className="flex-1 h-full flex items-center justify-center max-w-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 h-full bg-green-100s p-2 max-w-screen">
      <ChatHeader
        chatId={chatId!}
        title={data?.title}
        participants={data?.participants}
        createdAt={data?.createdAt}
      />
      <ChatContainer data={data} user={user} chatroomId={chatId} />
    </div>
  )
}

export default Chat