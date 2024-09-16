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
    participants: {
      participantId: string,
      participantPicture: string
    }[],
    createdAt: Date,
    updatedAt: Date,
    image: string
  },
  user: User | null,
  friendStatuses?: { [friendId: string]: 'online' | 'away' };
}

const ChatRoomItem = ({ data, friendStatuses, user }: ChatRoomItem) => {

  const { chatId } = useParams()
  const [lastMessage, setLastMesage] = useState("")

  const { title, image, id, participants } = data

  useEffect(() => {

    socket.on("lastMessage", async (message, chatroomId) => {
      console.log(message)
      if (data.id === chatroomId) {
        setLastMesage(message)
      }
    })

    return (() => {
      socket.off("lastMessage")
    })
  }, [data.id, lastMessage])

  const content = (
    <div className={cn("w-full p-2 rounded-lg hover:bg-gray-100 flex items-center transition-colors", chatId === id ? "cursor-default bg-gray-100" : "hover:cursor-pointer")}>
      <div className="relative flex min-w-[90%] max-w-[90%] bg-blue-30 space-x-2">
        {
          data.participants.length === 2 ? (
            data.participants
              .filter(participant => participant.participantId !== user?.id)
              .map((participant, index) => (
                <Avatar key={index}>
                  <AvatarImage src={participant.participantPicture} />
                </Avatar>
              ))
          )
            : (
              <div className="flex items-center space-x-[-25px]">
                {
                  data.participants
                    .filter(participant => participant.participantId !== user?.id)
                    .slice(0, 4)
                    .map((participant, index) => (
                      <Avatar
                        key={index}
                        className={`relative border border-white z-[${4 - index}]`}
                      >
                        <AvatarImage src={participant.participantPicture} />
                      </Avatar>
                    ))
                }
                {data.participants.length > 4 && (
                  <div className="relative z-0 w-8 h-8 rounded-full bg-gray-200 text-xs font-medium flex items-center justify-center border border-white">
                    +{data.participants.length - 4}
                  </div>
                )}
              </div>
            )
        }
        <div className="mr-auto max-w-[70%] bg-red-200s">
          {
            data.participants.length === 2 ? (
              <span className="text-sm font-semibold">
                {
                  title.split(",")
                    .filter(name => name.trim() !== user?.name)
                    .map(friendName => {
                      return friendName.trim()
                    })
                }
              </span>
            ) : (
              <span className="text-sm font-semibold truncate">
                {title}
              </span>
            )
          }
          <p className="text-xs font-base max-w-full truncate bg-blue-200s">{lastMessage}</p>
        </div>
      </div>
      <div className="bg-red-200s mb-auto">
        <span className="text-xs text-gray-500">6/25</span>
      </div>
    </div>
  )

  return chatId === id ? content : <Link to={`/dashboard/chat/${id}`}>{content}</Link>
}

export default ChatRoomItem