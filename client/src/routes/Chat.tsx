import { useParams } from "react-router-dom"
import ChatHeader from "../components/dashboard/chat/ChatHeader"
import { useGetChatInfo } from "../lib/data"
import { useUser } from "../components/context/UserProvider"

const Chat = () => {

  const { chatId } = useParams()
  const { user } = useUser()
  const { data } = useGetChatInfo(chatId, user?.id)

  console.log(data)

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