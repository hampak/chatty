import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { User } from "@/types"
import { socket } from "@/utils/io"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

interface ChatRoomItem {
  data: {
    id: string,
    title: string,
    participants: string[],
    createdAt: Date,
    updatedAt: Date,
    image: string
  },
  user: User | null,
  isFriendOnline?: boolean
}

const ChatRoomItem = ({ data, user }: ChatRoomItem) => {

  const [isFriendOnline, setIsFriendOnline] = useState(false)
  const { chatId } = useParams()

  const { title, image, id, participants } = data
  const friendId = participants.find(id => id !== user?.id)

  console.log(friendId)

  useEffect(() => {

    // socket.on("onlineUsers", (onlineUsers) => {
    //   if (onlineUsers.includes(friendId)) {
    //     setIsFriendOnline(true)
    //   }
    // })

    socket.on("newUserOnline", (userId) => {
      console.log("newUserOnline", userId)
      if (userId === friendId) {
        setIsFriendOnline(true)
      }
    })

    socket.on("userDisconnect", (userId) => {
      if (userId === friendId) {
        setIsFriendOnline(false)
      }
    })

    return (() => {
      socket.off("onlineUsers");
      socket.off("newUserOnline");
      socket.off("userDisconnect");
    })
  }, [friendId])


  const content = (
    <div className={cn("w-full p-2 rounded-lg hover:bg-gray-100 flex items-center transition-colors", chatId === id ? "cursor-default bg-gray-100" : "hover:cursor-pointer")}>
      <div className="mr-2 relative inline-block">
        <Avatar>
          <AvatarImage src={image} />
        </Avatar>
        {
          isFriendOnline ? <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" /> : <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full" />
        }
      </div>
      <div className="mr-auto">
        <span className="text-sm font-semibold">{title}</span>
        <p className="text-xs font-base">Last Message</p>
      </div>
      <div className="bg-red-200s mb-auto">
        <span className="text-xs text-gray-500">6/25</span>
      </div>
    </div>
  )

  return chatId === id ? content : <Link to={`/dashboard/chat/${id}`}>{content}</Link>
}

export default ChatRoomItem