import { useUser } from "@/components/provider/UserProvider";
import { useGetChatsList } from "@/lib/data";
import { socket } from "@/utils/io";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCirclePlus } from "lucide-react";
import { useEffect } from "react";
import ChatRoomItem from "./ChatRoomItem";

const ChatList = () => {


  const { user } = useUser()
  const { data, isLoading } = useGetChatsList({ userId: user?.id })
  const queryClient = useQueryClient()

  useEffect(() => {
    socket.on("addedInChatroom", async () => {
      await queryClient.invalidateQueries({ queryKey: ["chat_list", user?.id] })
    })
  }, [queryClient, user?.id])

  if (isLoading || !data) {
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
            return (
              <div key={index} className="w-full">
                <ChatRoomItem
                  data={room}
                  user={user}
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