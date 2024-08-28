import { useUser } from "@/components/context/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2 } from "lucide-react";
import ChatRoomItem from "./ChatRoomItem";
import { useEffect } from "react";
import { socket } from "@/utils/io";

const ChatList = () => {

  const { user } = useUser()

  const { data } = useGetChatsList({ userId: user?.id })

  useEffect(() => {
    // socket.on("online-users", (onlineFriends) => {
    //   console.log(onlineFriends)
    // })

    socket.on("user-offline", (userId) => {
      console.log(`${userId} is now offline`)
    })

    socket.on("update-online-users", (onlineFriends) => {
      console.log(onlineFriends)
    })

    return (() => {
      socket.off("update-online-users")
      socket.off("user-offline")
    })
  }, [])

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