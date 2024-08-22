interface ChatRoomItem {
  data: {
    id: string,
    title: string,
    paticipants: string[],
    createdAt: Date,
    updatedAt: Date
  }
}

const ChatRoomItem = ({ data }: ChatRoomItem) => {

  const { title, id } = data

  return (
    <div className="w-full p-2 rounded-lg bg-gray-100">
      {title}
    </div>
  )
}

export default ChatRoomItem