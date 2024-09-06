import { socket } from "@/utils/io"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

interface MessagesContainerProps {
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  }
}

const MessagesContainer = ({ user }: MessagesContainerProps) => {

  const [messages, setMessages] = useState([])
  const queryClient = useQueryClient()

  useEffect(() => {
    socket.on("message", async (message) => {
      if (messages.length === 0) {
        setMessages((prevState) => prevState.concat(message))
        await queryClient.invalidateQueries({
          queryKey: ["chat_list", user.id]
        })
      } else {
        setMessages((prevState) => prevState.concat(message))
      }
    })
  }, [messages.length, queryClient, user.id])

  return (
    <div className="bg-blue-300s h-[93%]">
      {
        messages.map((m, index) => (
          <div key={index}>
            {m}
          </div>
        ))
      }
    </div>
  )
}

export default MessagesContainer