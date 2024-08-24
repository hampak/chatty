import { Loader2 } from "lucide-react";
import { useGetChatsList } from "../../lib/data";
import { useUser } from "../context/UserProvider";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {

  const { user } = useUser()

  const { data } = useGetChatsList(user?.id)

  if (data?.length === 0) {
    return (
      <div>No chats yet! Create a new room :)</div>
    )
  }

  return (
    <div className="mt-6 h-full w-full bg-green-700s space-y-2">
      {
        data ? (
          data.map((room, index) => (
            <div key={index} className="w-full">
              <ChatRoomItem
                data={room}
              />
            </div>
          ))
        ) : (
          <Loader2 className="animate-spin" />
        )
      }
    </div>
  )
}

export default ChatList