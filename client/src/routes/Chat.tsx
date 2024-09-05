import { useParams } from "react-router-dom"
import { useUser } from "../components/provider/UserProvider"
import ChatHeader from "../components/dashboard/chat/ChatHeader"
import { useGetChatInfo } from "../lib/data"
import ChatContainer from "@/components/dashboard/chat/ChatContainer"

const Chat = () => {

  const { chatId } = useParams()
  const { user } = useUser()

  const { data } = useGetChatInfo({ chatId: chatId, userId: user?.id })

  return (
    <div className="flex-1 h-full bg-green-100s p-2">
      <ChatHeader
        chatId={chatId!}
        title={data?.title}
        participants={data?.participants}
        createdAt={data?.createdAt}
      />
      <ChatContainer />
    </div>
  )
}

export default Chat