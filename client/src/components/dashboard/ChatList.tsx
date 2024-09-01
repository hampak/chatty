import { useUser } from "@/components/provider/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {


  const { user } = useUser()
  const { onlineFriends } = useSocket()
  const { data } = useGetChatsList({ userId: user?.id })

  if (!user) return null

  const getFriendStatus = (participantIds: string[]): { [friendId: string]: "online" | "away" } => {
    if (!user || !onlineFriends) return {}

    const friendIds = participantIds.filter(id => id !== user.id);
    const statuses = friendIds.reduce<{ [friendId: string]: 'online' | 'away' }>((acc, friendId) => {
      const status = onlineFriends[friendId];
      if (status) {
        acc[friendId] = status;
      }
      return acc;
    }, {});

    return statuses;
  }

  return (
    <div className="mt-2 h-full w-full bg-green-700s space-y-2 overflow-y-auto custom-scrollbar">
      {
        data ? (
          data.length === 0 ? (
            <div>No Chats Yet! Invite a friend :)</div>
          ) : (
            data.map((room, index) => {
              const statuses = getFriendStatus(room.participants)
              return (
                <div key={index} className="w-full">
                  <ChatRoomItem
                    data={room}
                    user={user}
                    // isFriendOnline={isFriendOnline(room.participants)}
                    friendStatuses={statuses}
                  />
                </div>
              )
            })
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