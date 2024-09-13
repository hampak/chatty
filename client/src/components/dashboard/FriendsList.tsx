import { useGetFriendsList } from "@/lib/data"
import { Avatar } from "@radix-ui/react-avatar"
import { Loader2, MessageCirclePlus, Plus } from "lucide-react"
import { AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import AddFriendModal from "./AddFriendModal"
import CreateChatModal from "./CreateChatModal"

const Label = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <TooltipProvider
      delayDuration={0}
    >
      <Tooltip>
        <TooltipTrigger className="w-full h-full flex items-center justify-center">
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={10}
          align="center"
          className="bg-black"
        >
          <span className="text-white">{title}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface FriendDropdownProps {
  children: React.ReactNode;
  name: string
}

const FriendDropdown = ({ children, name }: FriendDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full h-full flex items-center justify-center focus:outline-none">{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        sideOffset={6}
        className="space-y-2"
      >
        <h1 className="text-sm font-semibold">{name}</h1>
        {/* <Button className="w-full h-6" size="sm">Chat</Button> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


const FriendsList = ({ userId }: { userId?: string }) => {

  const { data, isPending } = useGetFriendsList({ userId: userId })

  return (
    <div className="w-[18%] h-full bg-red-200s border-r-[1px] p-1 flex-col">
      {/* Add Friend Modal */}
      <div className="h-[18%] flex flex-col items-center justify-evenly bg-blue-400s">
        <div className="h-12 w-12 aspect-square bg-black rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:rounded-xl">
          <AddFriendModal>
            <Label title="Add a Friend">
              <Plus className="text-white" size={22} />
            </Label>
          </AddFriendModal>
        </div>
        <div className="h-12 w-12 aspect-square bg-black rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:rounded-xl">
          <CreateChatModal data={data}>
            <Label title="Create a Chat">
              <MessageCirclePlus className="text-white" size={22} />
            </Label>
          </CreateChatModal>
        </div>
        <Separator className="h-1 rounded-lg w-[60%]" />
      </div>

      {/* Friend List Component */}
      <div className="bg-red-200s w-full h-[82%] flex flex-col space-y-1 items-center overflow-y-auto scrollbar-hide">
        {
          !data || isPending ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            Array.isArray(data) && data.length > 0 ? (
              data.map(f => (
                <Avatar className="h-12 w-12 mb-1.5" key={f.userId}>
                  <FriendDropdown
                    name={f.name}
                  >
                    <AvatarImage
                      className="rounded-3xl hover:rounded-xl transition-all duration-150 hover:cursor-pointer"
                      src={f.image}
                    />
                  </FriendDropdown>
                </Avatar>
              ))
            ) : (
              <></>
            )
          )
        }
      </div>
    </div>
  )
}

export default FriendsList