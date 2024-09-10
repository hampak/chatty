import { useUser } from "@/components/provider/UserProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/utils/zustand"
import { useEffect } from "react"
import { CiLogout } from "react-icons/ci"
import { RxHamburgerMenu } from "react-icons/rx"
import { useSocket } from "../context/SocketContext"
import ChatList from "./ChatList"
import CreateChatModal from "./CreateChatModal"
import LogoutAlert from "./LogoutAlert"
import UserSettingsModal from "./UserSettingsModal"
import { Separator } from "../ui/separator";

const Sidebar = () => {

  const { isOpen, toggleSidebar, openSidebar } = useSidebarStore()
  const { user, loading } = useUser()
  const { currentStatus } = useSocket()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        openSidebar()
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [openSidebar])

  const statusIndicator = currentStatus === "online" ? (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
  ) : currentStatus === "away" ? (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
  ) : (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full" />
  );

  return (
    <div className={cn("w-[400px] h-full bg-green-200s py-2 border-r-[1px] bg-white", isOpen ? "flex " : "hidden")}>

      {/* Friends List */}
      <div className="w-[18%] h-full bg-red-200s border-r-[1px] p-1 flex-col">
        {/* Add Friend Modal */}
        <div className="space-y-2 h-[10%] flex flex-col items-center bg-blue-400s">
          <div className="w-[85%] aspect-square bg-blue-200 rounded-full">

          </div>

          <Separator className="h-1 rounded-lg w-[60%]" />
        </div>

        {/* Friend List Component */}
        <div className="bg-red-200 w-full h-[90%]">

        </div>
      </div>

      <div className="w-[82%] h-full bg-green-200s px-1">
        <div className="w-full h-[7%] bg-red-200s flex justify-between items-center border-b-[1px]">
          <span className="text-lg font-simbold">
            Chatty
          </span>
          <RxHamburgerMenu
            className={cn("h-5 w-5 hover:cursor-pointer transition-colors hover:text-gray-400 md:hidden")}
            onClick={toggleSidebar}
          />
        </div>

        <div className="flex flex-col bg-purple-200s h-[93%] pt-2">

          {/* Chat */}
          <div className="w-full h-[92%] flex-1 bg-green-300s">
            <CreateChatModal>
              <div className="h-[10%] bg-black text-white p-2 rounded-lg">
                Start a new chat
              </div>
            </CreateChatModal>
            <div className="h-[90%]">
              <ChatList />
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="w-full bg-red-300s border-t-[1px] flex items-center justify-between bg-whites z-50 h-[8%] pt-2">
            {
              loading ? "" : (
                <div className="relative inline-block">
                  <UserSettingsModal>
                    <Avatar>
                      <AvatarImage
                        src={user?.picture}
                      />
                    </Avatar>
                  </UserSettingsModal>
                  {statusIndicator}
                </div>
              )
            }
            <LogoutAlert>
              <CiLogout
                className="h-5 w-5 hover:cursor-pointer hover:text-gray-400 transition-colors"
              />
            </LogoutAlert>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar