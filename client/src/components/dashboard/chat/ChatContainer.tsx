import MessageInput from "./MessageInput"
import MessagesContainer from "./MessagesContainer"

const ChatContainer = () => {
  return (
    <div className="bg-red-200s h-[calc(100%-40px)] py-2">
      <MessagesContainer />
      <MessageInput />
    </div>
  )
}

export default ChatContainer