import { RxDotsHorizontal } from "react-icons/rx";


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
          <RxDotsHorizontal className="text-lg" />
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