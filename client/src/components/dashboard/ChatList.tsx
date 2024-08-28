import { useUser } from "@/components/context/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2 } from "lucide-react";
import ChatRoomItem from "./ChatRoomItem";
import { useEffect } from "react";
import { socket } from "@/utils/io";

const ChatList = () => {

  const { user } = useUser()

  const { data } = useGetChatsList({ userId: user?.id })

  return (
    <div className="mt-2 h-full w-full bg-green-700s space-y-2 overflow-y-auto custom-scrollbar">
      {
        data ? (
          data.length === 0 ? (
            <div>No Chats Yet! Invite a friend :)</div>
          ) : (
            data.map((room, index) => (
              <div key={index} className="w-full">
                <ChatRoomItem
                  data={room}
                  user={user}
                // isFriendOnline={isUserOnline(room.participants)}
                // isFriendOnline={ }
                />
              </div>
            ))
          )
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