import { useLocation, useParams } from "react-router-dom"
import { useUser } from "../components/provider/UserProvider"
import ChatHeader from "../components/dashboard/chat/ChatHeader"
import { useGetChatInfo } from "../lib/data"
import ChatContainer from "@/components/dashboard/chat/ChatContainer"
import { Loader2 } from "lucide-react"

const Chat = () => {

  const { chatId } = useParams()
  const { user } = useUser()
  const location = useLocation()

  const { data } = useGetChatInfo({ chatId: chatId, userId: user?.id })
  if (!data || !user) {
    return (
      <div className="flex-1 h-full flex items-center justify-center max-w-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  console.log("location", location)

  return (
    <div className="flex-1 h-full bg-green-100s p-2 max-w-screen">
      <ChatHeader
        chatId={chatId!}
        title={data?.title}
        participants={data?.participants}
        createdAt={data?.createdAt}
      />
      <ChatContainer data={data} user={user} chatroomId={chatId} location={location} />
    </div>
  )
}

export default Chat