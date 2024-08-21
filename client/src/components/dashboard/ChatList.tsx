import { useGetChatsList } from "../../lib/data";
import { useUser } from "../context/UserProvider";

const ChatList = () => {

  const { user } = useUser()

  const { data, isPending } = useGetChatsList(user?.id)

  if (isPending) {
    return null
  }

  return (
    <div className="mt-3 h-full w-full bg-green-700s">
      {data.map((room, index) => (
        <div key={index}>
          {room.room_title}
        </div>
      ))}
    </div>
  )
}

export default ChatList