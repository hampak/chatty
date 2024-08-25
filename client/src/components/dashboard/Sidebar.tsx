import { useUser } from "@/components/context/UserProvider"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/utils/zustand"
import { useEffect } from "react"
import { CiLogout } from "react-icons/ci"
import { RxHamburgerMenu } from "react-icons/rx"
import ChatList from "./ChatList"
import CreateChatModal from "./CreateChatModal"
import LogoutAlert from "./LogoutAlert"

const Sidebar = () => {

  const { isOpen, toggleSidebar, openSidebar } = useSidebarStore()
  const { user, loading } = useUser()

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

  return (
    <div className={cn("w-[300px] h-full bg-green-200s px-2 border-r-[1px]", isOpen ? "block " : "hidden")}>
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

        {/* Chat / Friends List */}
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
        <div className="w-full bg-red-300s border-t-[1px] flex items-center justify-between bg-whites z-50 h-[8%]">
          {
            loading ? "" : (
              <Avatar>
                <AvatarImage
                  src={user?.picture}
                />
              </Avatar>
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
  )
}

export default Sidebar