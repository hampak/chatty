import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { socket } from "@/utils/io"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

interface MessagesContainerProps {
  user: {
    id: string,
    name: string,
    online: boolean,
    picture: string,
    userTag: string
  },
  messages: {
    message: string,
    senderId: string,
    timestamp: number,
    senderImage: string
  }[]
}

interface Message {
  message: string;
  senderId: string;
  timestamp: number;
  senderImage?: string
}

const MessagesContainer = ({ user, messages }: MessagesContainerProps) => {

  const [messageList, setMessageList] = useState<Message[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { chatId } = useParams()


  const getDateString = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    setMessageList(messages)
  }, [messages])

  useEffect(() => {
    const handleMessage = (message: string, senderId: string, timestamp: number, incomingChatroomId: string, senderImage: string) => {
      const newMessage: Message = { message, senderId, timestamp, senderImage };

      if (incomingChatroomId === chatId) {
        setMessageList((prevState) => [...prevState, newMessage]);
      }
    };

    socket.on("message", handleMessage)

    return () => {
      socket.off("message", handleMessage)
    }
  }, [chatId])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messageList])

  return (
    <div
      ref={chatContainerRef}
      className="bg-blue-300s h-[93%] overflow-y-auto max-w-full px-5 custom-scrollbar pb-3"
    >
      {
        messageList.map((m, index) => {
          const currentMessageDate = getDateString(m.timestamp)

          const previousMessage = messageList[index - 1]
          const previousMessageDate = previousMessage ? getDateString(previousMessage.timestamp) : null

          return (
            <div key={index}>
              {
                previousMessageDate !== currentMessageDate && (
                  <div className="relative flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="px-4 bg-white text-gray-500 text-sm">
                      {currentMessageDate}
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                )
              }
              <div className={cn("mb-2 bg-red-200s", m.senderId === user.id ? "flex flex-col items-end" : "flex flex-col items-start")}>
                {
                  m.senderId === user.id ? (
                    <div className="flex space-x-2 bg-red-200s max-w-[300px] md:max-w-[550px] justify-end break-words">
                      <div className="text-xs text-gray-400 mt-auto">
                        {
                          new Date(m.timestamp).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        }
                      </div>
                      <p className="py-1 px-2.5 bg-blue-500 text-white rounded-tl-lg rounded-br-lg rounded-bl-lg break-words max-w-[85%]">
                        {m.message}
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-2 bg-red-200s max-w-[300px] md:max-w-[550px] break-words">
                      <Avatar>
                        <AvatarImage src={m.senderImage} />
                      </Avatar>
                      <p className="py-1 px-2.5 bg-gray-200 rounded-tr-lg rounded-br-lg rounded-bl-lg h-min mt-auto break-words max-w-[80%]">
                        {m.message}
                      </p>
                      <div className="text-xs text-gray-400 mt-auto">
                        {
                          new Date(m.timestamp).toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        }
                      </div>
                    </div>
                  )
                }
                {/* <div className="text-xs text-gray-400">
                  {
                    new Date(m.timestamp).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  }
                </div> */}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default MessagesContainer