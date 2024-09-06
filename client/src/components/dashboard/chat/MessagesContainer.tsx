import { socket } from "@/utils/io"
import { useEffect, useState } from "react"

const MessagesContainer = () => {

  const [messages, setMessages] = useState([])

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevState) => prevState.concat(message))
    })
  }, [])

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