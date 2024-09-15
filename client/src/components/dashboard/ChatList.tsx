import { useUser } from "@/components/provider/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2, MessageCirclePlus } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {


  const { user } = useUser()
  const { onlineFriends } = useSocket()
  const { data, isPending } = useGetChatsList({ userId: user?.id })

  // console.log("data", data)

  // const getFriendStatus = (participantIds: string[]): { [friendId: string]: "online" | "away" } => {
  //   if (!user || !onlineFriends) return {}

  //   const friendIds = participantIds.filter(id => id !== user.id);
  //   const statuses = friendIds.reduce<{ [friendId: string]: 'online' | 'away' }>((acc, friendId) => {
  //     const status = onlineFriends[friendId];
  //     if (status) {
  //       acc[friendId] = status;
  //     }
  //     return acc;
  //   }, {});
  //   return statuses;
  // }

  if (isPending || !data) {
    return (
      <div className="mt-2 h-full w-full bg-green-700s">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 h-full w-full bg-green-700s space-y-2 overflow-y-auto custom-scrollbar">
      {
        data && Array.isArray(data) && data.length > 0 ? (
          data.map((room, index) => {
            // const statuses = getFriendStatus(room.participants)
            return (
              <div key={index} className="w-full">
                <ChatRoomItem
                  data={room}
                  user={user}
                // friendStatuses={statuses}
                />
              </div>
            )
          })
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="w-[80%] text-center">No Chats Yet! Start one by clicking on the <MessageCirclePlus className="inline-flex " size={18} /> icon</p>
          </div>
        )
      }
    </div>
  )
}

export default ChatList