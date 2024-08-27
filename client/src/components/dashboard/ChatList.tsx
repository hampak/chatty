import { useUser } from "@/components/context/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { Loader2 } from "lucide-react";
import ChatRoomItem from "./ChatRoomItem";
import { useEffect, useState } from "react";
import { socket } from "@/utils/io";

const ChatList = () => {

  const { user } = useUser()

  const { data } = useGetChatsList({ userId: user?.id })

  useEffect(() => {
    socket.on("userOnline", (userId: string) => {
      console.log(userId)
    })
  }, [])
  // const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // console.log(onlineUsers)

  // useEffect(() => {
  //   const handleUserOnline = (userId: string) => {
  //     if (userId !== user?.id) {
  //       setOnlineUsers((prev) => new Set(prev).add(userId));
  //     }
  //   };

  //   // Initial setup for socket events
  //   socket.on("userOnline", handleUserOnline);

  //   // Cleanup socket events on component unmount
  //   return () => {
  //     socket.off("userOnline", handleUserOnline);
  //   };
  // }, [user?.id]);

  // const isUserOnline = (userId: string) => {
  //   return onlineUsers.has(userId);
  // };

  // useEffect(() => {
  //   socket.on("userOnline", (userId: string) => {
  //     setOnlineUsers((prev) => new Set(prev).add(userId))
  //     console.log("USER CONNECTED ON CLIENT", userId)
  //   })
  // }, [user?.id])

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
                // isFriendOnline={(room.participants || []).some(participantId => isUserOnline(participantId))}
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