import { useUser } from "@/components/context/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {


  const { user } = useUser()
  const { onlineFriends } = useSocket()

  console.log(onlineFriends)

  const { data } = useGetChatsList({ userId: user?.id })

  // const isFriendOnline = (participantIds: string[]) => {
  //   console.log(onlineFriends)
  //   // const onlineFriendIds = onlineFriends
  //   //   .map(id => console.log(id))
  //   // .map(friend => friend.userId)
  //   // .map(friend => console.log(friend))
  //   // .filter(id => id == user?.id);
  //   // console.log(onlineFriendIds)
  //   // participantIds.some(id => onlineFriends.includes(id))
  //   return participantIds.some(id => onlineFriends.includes(id))
  // }

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
                // isFriendOnline={isFriendOnline(room.participants)}
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