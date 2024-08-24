import { useParams } from "react-router-dom"
import { useUser } from "../components/context/UserProvider"
import ChatHeader from "../components/dashboard/chat/ChatHeader"
import { useGetChatInfo } from "../lib/data"

const Chat = () => {

  const { chatId } = useParams()
  const { user } = useUser()

  const { data, } = useGetChatInfo(chatId, user?.id)

  return (
    <div className="flex-1 h-full bg-green-100s p-2">
      {/* {chatId} */}
      <ChatHeader
        chatId={chatId!}
        title={data?.title}
        participants={data?.participants}
        createdAt={data?.createdAt}
      />
      {/* <ChatContainer /> */}
    </div>
  )
}

export default Chat