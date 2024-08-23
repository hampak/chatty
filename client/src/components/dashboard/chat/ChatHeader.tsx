import { RxDotsHorizontal } from "react-icons/rx";
import ChatInfoPopover from "./ChatInfoPopover";


interface ChatHeaderProps {
  chatId: string
  title: string
}

const ChatHeader = ({ chatId, title }: ChatHeaderProps) => {
  return (
    <>
      <div className="h-[40px] bg-green-200s">
        {/* On small screens */}
        <div className="h-full md:hidden flex items-center justify-end px-2">
          <ChatInfoPopover>
            <RxDotsHorizontal className="text-lg" />
          </ChatInfoPopover>
        </div>

        {/* On larger screens */}
        <div className="h-full hidden md:flex items-center justify-start lg:pl-4 border-b-[1px]">
          {title}
        </div>
      </div>
    </>
  )
}

export default ChatHeader