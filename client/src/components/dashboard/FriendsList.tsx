import { useGetFriendsList } from "@/lib/data"
import { socket } from "@/utils/io"
import { Avatar } from "@radix-ui/react-avatar"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, MessageCirclePlus, Plus } from "lucide-react"
import { useEffect } from "react"
import { useSocket } from "../context/SocketContext"
import { AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Separator } from "../ui/separator"
import AddFriendModal from "./AddFriendModal"
import CreateChatModal from "./CreateChatModal"

// const Label = ({ children, title }: { children: React.ReactNode, title: string }) => {
//   return (
//     <TooltipProvider
//       delayDuration={0}
//     >
//       <Tooltip>
//         <TooltipTrigger className="w-full h-full flex items-center justify-center">
//           {children}
//         </TooltipTrigger>
//         <TooltipContent
//           side="right"
//           sideOffset={10}
//           align="center"
//           className="bg-black"
//         >
//           <span className="text-white">{title}</span>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   )
// }

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

  const queryClient = useQueryClient()
  const { data, isPending } = useGetFriendsList({ userId: userId })
  const { onlineFriends } = useSocket()

  useEffect(() => {
    socket.on("addedAsFriend", async () => {
      await queryClient.invalidateQueries({ queryKey: ["friend_list", userId] })
    })
  }, [queryClient, userId])

  const friendStatus = (friendId: string): "online" | "away" | "offline" => {
    const friendData = onlineFriends[friendId]
    return friendData ? friendData.status : "offline"
  }

  return (
    <div className="w-[18%] h-full bg-red-200s border-r-[1px] p-1 flex-col">
      {/* Add Friend Modal */}
      <div className="h-[18%] flex flex-col items-center justify-evenly bg-blue-400s">
        <div className="h-12 w-12 aspect-square bg-black rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-150 hover:rounded-xl">
          {/* <Label title="Add a Friend"> */}
          <AddFriendModal>
            <Plus className="text-white" size={22} />
          </AddFriendModal>
          {/* </Label> */}
        </div>
        <div className="h-12 w-12 aspect-square rounded-3xl flex items-center justify-center bg-black cursor-pointer transition-all duration-150 hover:rounded-xl">
          {/* <Label title="Create a Chat"> */}
          <CreateChatModal data={data}>
            <MessageCirclePlus className="text-white" size={22} />
          </CreateChatModal>
          {/* </Label> */}
        </div>
        <Separator className="h-1 rounded-lg w-[60%]" />
      </div>

      {/* Friend List Component */}
      <div className="bg-red-200s w-full h-[82%] flex flex-col space-y-2.5 items-center overflow-y-auto scrollbar-hide">
        {
          !data || isPending ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            Array.isArray(data) && data.length > 0 ? (
              data.map(f => {

                const status = friendStatus(f.userId)

                const statusIndicator = status === "online" ? (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                ) : status === "away" ? (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
                ) : (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full" />
                );

                return (
                  <Avatar className="h-12 w-12 relative" key={f.userId}>
                    <FriendDropdown
                      name={f.name}
                    >
                      <AvatarImage
                        className="rounded-3xl hover:rounded-xl transition-all duration-150 hover:cursor-pointer border border-gray-200"
                        src={f.image}
                      />
                      {statusIndicator}
                    </FriendDropdown>
                  </Avatar>
                )
              })
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