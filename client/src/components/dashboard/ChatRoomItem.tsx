import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { User } from "@/types"
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
  friendStatuses: { [friendId: string]: 'online' | 'away' };
}

const ChatRoomItem = ({ data, friendStatuses, user }: ChatRoomItem) => {

  const { chatId } = useParams()

  const { title, image, id, participants } = data

  const participantStatuses = participants
    .filter(participantId => participantId !== user?.id)
    .map(participantId => friendStatuses[participantId])

  const statusIndicator = participantStatuses.includes('online') ? (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
  ) : participantStatuses.includes('away') ? (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
  ) : (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full" />
  );


  const content = (
    <div className={cn("w-full p-2 rounded-lg hover:bg-gray-100 flex items-center transition-colors", chatId === id ? "cursor-default bg-gray-100" : "hover:cursor-pointer")}>
      <div className="mr-2 relative inline-block">
        <Avatar>
          <AvatarImage src={image} />
        </Avatar>
        {statusIndicator}
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