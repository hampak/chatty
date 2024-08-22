import { Avatar, AvatarImage } from "../ui/avatar"

interface ChatRoomItem {
  data: {
    id: string,
    title: string,
    paticipants: string[],
    createdAt: Date,
    updatedAt: Date,
    image: string
  }
}

const ChatRoomItem = ({ data }: ChatRoomItem) => {

  const { title, image } = data

  return (
    <div className="w-full p-2 rounded-lg hover:bg-gray-100 hover:cursor-pointer flex items-center transition-colors">
      <Avatar className="mr-2">
        <AvatarImage src={image} />
      </Avatar>
      <div className="mr-auto">
        <span className="text-sm font-semibold">{title}</span>
        <p className="text-xs font-base">Last Message</p>
      </div>
      <div className="bg-red-200s mb-auto">
        <span className="text-xs text-gray-500">6/25</span>
      </div>
    </div>
  )
}

export default ChatRoomItem