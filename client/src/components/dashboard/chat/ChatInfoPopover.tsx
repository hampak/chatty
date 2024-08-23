import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useUser } from "../../context/UserProvider";
import { Separator } from "../../ui/separator";

interface ChatInfoPopoverProps {
  children: React.ReactNode,
  friendName?: string,
  participants?: string[],
  createdAt?: string
}

const ChatInfoPopover = ({ children, participants, createdAt }: ChatInfoPopoverProps) => {

  const { user } = useUser()
  const [open, setOpen] = useState(false)

  console.log(participants)

  useEffect(() => {
    const closeOnLargeScreen = () => {
      if (window.innerWidth >= 768) {
        setOpen(false)
      }
    }
    window.addEventListener("resize", closeOnLargeScreen)
    closeOnLargeScreen()

    return () => window.removeEventListener("resize", closeOnLargeScreen)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="p-1 hover:bg-gray-100 rounded-lg transition-colors">{children}</PopoverTrigger>
      <PopoverContent
        className="md:hidden p-3"
        align={"end"}
        alignOffset={-5}
      >
        <span className="text-sm font-semibold">Participants</span>
        <ul className="mt-1 space-y-1">
          {
            participants?.map((p, index) => (
              <li
                key={index}
                className="text-sm text-gray-800"
              >
                {p}
                {p === user?.name ? <span className="ml-1 text-xs text-black underline underline-offset-1">me</span> : null}
              </li>
            ))
          }
        </ul>

        <Separator className="my-3" />
        <span>Room created by {participants ? participants[0] : ""} on {createdAt}</span>
      </PopoverContent>
    </Popover>
  )
}

export default ChatInfoPopover