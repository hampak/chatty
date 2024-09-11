import { Avatar } from "@radix-ui/react-avatar"
import { Separator } from "../ui/separator"
import { AvatarImage } from "../ui/avatar"
import { Loader2, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import AddFriendModal from "./AddFriendModal"
import { useGetFriendsList } from "@/lib/data"

const Label = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider
      delayDuration={0}
    >
      <Tooltip>
        <TooltipTrigger className="w-full h-full flex items-center justify-center">
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={"right"}
          sideOffset={10}
          align="center"
          className="bg-black"
        >
          <span className="text-white">Add a friend</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const FriendsList = ({ userId }: { userId?: string }) => {

  const { data, isPending } = useGetFriendsList({ userId: userId })

  return (
    <div className="w-[18%] h-full bg-red-200s border-r-[1px] p-1 flex-col space-y-3">
      {/* Add Friend Modal */}
      <div className="space-y-2 h-[9%] flex flex-col items-center bg-blue-400s">
        <AddFriendModal>
          <div className="h-12 w-12 aspect-square bg-black rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:rounded-xl">
            <Label>
              <Plus className="text-white" />
            </Label>
          </div>
        </AddFriendModal>
        <Separator className="h-1 rounded-lg w-[60%]" />
      </div>

      {/* Friend List Component */}
      <div className="bg-red-200s w-full h-[91%] flex flex-col space-y-2 items-center overflow-y-auto scrollbar-hide">
        {
          !data || isPending ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            Array.isArray(data) && data.length > 0 ? (
              data.map(f => (
                <Avatar className="h-12 w-12 mb-2">
                  <AvatarImage
                    className="rounded-3xl hover:rounded-xl transition-all duration-150 cursor-pointer"
                    src={f.image}
                  />
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