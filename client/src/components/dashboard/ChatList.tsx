import { useGetChatsList } from "../../lib/data"
import { useUser } from "../context/UserProvider"
import { ImSpinner8 } from "react-icons/im";

const ChatList = () => {

  const { user, loading } = useUser()

  const { data } = useGetChatsList(user?.id)


  // if (!user || loading) {
  //   return (
  //     <div className="mt-3 h-full w-full bg-green-700s flex items-center justify-center">
  //       <ImSpinner8 className="w-6 h-6 animate-spin" />
  //     </div>
  //   )
  // }

  console.log(data)

  return (
    <div className="mt-3 h-full w-full bg-green-700s">
      hi
    </div>
  )
}

export default ChatList