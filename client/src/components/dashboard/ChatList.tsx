import { Loader2 } from "lucide-react";
import { useGetChatsList } from "@/lib/data";
import { useUser } from "@/components/context/UserProvider";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {

  const { user } = useUser()

  const { data } = useGetChatsList({ userId: user?.id })

  if (data?.length === 0) {
    return (
      <div>No chats yet! Create a new room :)</div>
    )
  }

  return (
    <div className="mt-2 h-full w-full bg-green-700s space-y-2 overflow-y-auto custom-scrollbar">
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
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        )
      }
    </div>
  )
}

export default ChatList