import { useEffect } from "react"
import { RxHamburgerMenu } from "react-icons/rx"
import { cn } from "../../lib/utils"
import { useSidebarStore } from "../../utils/zustand"
import { Avatar, AvatarImage } from "../ui/avatar"
import { useUser } from "../context/UserProvider"
import LogoutAlert from "./LogoutAlert"
import { CiLogout } from "react-icons/ci"

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
    <div className={cn("w-[300px] h-full bg-green-200s p-2 border-r-[1px]", isOpen ? "block" : "hidden")}>
      <div className="w-full h-[7%] bg-red-200s flex justify-between items-center border-b-[1px]">
        <span className="text-lg font-simbold">
          Chatty
        </span>
        <RxHamburgerMenu
          className={cn("h-5 w-5 hover:cursor-pointer transition-colors hover:text-gray-400 md:hidden")}
          onClick={toggleSidebar}
        />
      </div>

      <div className="flex flex-col bg-purple-200s h-[93%] pt-4">
        {/* <span className="text-lg font-semibold hidden md:block border-b-[1px] pb-2">
          Chatty
        </span> */}

        <div className="w-full flex-1 bg-green-300s">
          hi
        </div>

        <div className="w-full bg-red-300s border-t-[1px] pt-2 flex items-center justify-between">
          <Avatar>
            <AvatarImage
              src={user?.picture}
            />
          </Avatar>
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