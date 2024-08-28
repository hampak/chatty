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

  const { chatId } = useParams()

  const { title, image, id, participants } = data
  const friendId = participants.filter(p_id => p_id !== user?.id)[0]

  const [isFriendOnline, setIsFriendOnline] = useState(() => {
    const savedStatus = sessionStorage.getItem(`friend-${friendId}-online`)
    return savedStatus ? JSON.parse(savedStatus) : false
  })

  console.log(isFriendOnline)

  useEffect(() => {

    socket.on("online-users", (onlineUsers) => {
      if (onlineUsers.includes(friendId)) {
        setIsFriendOnline(true)
        sessionStorage.setItem(`friend-${friendId}-online`, JSON.stringify(true))
      }
    })

    socket.on("user-online", ({ userId }) => {
      console.log("userId", userId)
      if (userId === friendId) {
        // console.log(userId === friendId[0])
        setIsFriendOnline(true)
        sessionStorage.setItem(`friend-${friendId}-online`, JSON.stringify(true));
      }
    })

    socket.on('user-offline', ({ userId }) => {
      if (userId === friendId) {
        setIsFriendOnline(false)
        sessionStorage.setItem(`friend-${friendId}-online`, JSON.stringify(false));
      }
    })

    return () => {
      socket.off("user-online")
      socket.off('user-online');
      socket.off('user-offline');
    }
  }, [friendId, isFriendOnline])

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