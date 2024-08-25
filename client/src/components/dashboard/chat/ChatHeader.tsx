import { RxDotsHorizontal } from "react-icons/rx";
import ChatInfoPopover from "./ChatInfoPopover";


interface ChatHeaderProps {
  chatId: string
  title?: string,
  participants?: string[],
  createdAt?: string
}

const ChatHeader = ({ title, participants, createdAt }: ChatHeaderProps) => {

  return (
    <>
      <div className="h-[40px] bg-green-200s flex items-center justify-between md:border-b-[1px] lg:px-2 pb-2">
        {/* On larger screens */}
        <div className="h-full flex items-center">
          <p className="text-sm md:text-base">{title}</p>
        </div>

        {/* On small screens */}
        <div className="h-full flex items-center bg-red-200s">
          <ChatInfoPopover
            friendName={title}
            participants={participants}
            createdAt={createdAt}
          >
            <RxDotsHorizontal className="text-lg hover:cursor-pointer" />
          </ChatInfoPopover>
        </div>
      </div>
    </>
  )
}

export default ChatHeader