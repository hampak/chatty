import { useGetChatsList } from "../../lib/data";
import { useUser } from "../context/UserProvider";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {

  const { user } = useUser()

  const { data, isPending } = useGetChatsList(user?.id)

  if (isPending) {
    return null
  }

  return (
    <div className="mt-6 h-full w-full bg-green-700s space-y-2">
      {data?.map((room, index) => (
        <div key={index} className="w-full">
          <ChatRoomItem
            data={room}
          />
        </div>
      ))}
    </div>
  )
}

export default ChatList