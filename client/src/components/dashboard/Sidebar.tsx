import { useUser } from "@/components/provider/UserProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/utils/zustand";
import { useEffect } from "react";
import { CiLogout } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { useSocket } from "../context/SocketContext";
import ChatList from "./ChatList";
import FriendsList from "./FriendsList";
import LogoutAlert from "./LogoutAlert";
import UserSettingsModal from "./UserSettingsModal";
import { Link } from "react-router-dom";

const Sidebar = () => {

  const { isOpen, toggleSidebar, openSidebar } = useSidebarStore()
  const { user, isPending: loading } = useUser()
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
    <div className="absolute bottom-1 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
  ) : currentStatus === "away" ? (
    <div className="absolute bottom-1 right-0 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full" />
  ) : (
    <div className="absolute bottom-1 right-0 w-3 h-3 bg-gray-500 border-2 border-white rounded-full" />
  );

  return (
    <div className={cn("w-[400px] h-full py-2 border-r-[1px] bg-white inline-flex z-[40]", isOpen ? "fixed left-0 lg:relative" : "hidden")}>

      {/* Friends List */}
      <FriendsList userId={user?.id} />

      <div className="w-[82%] h-full bg-green-200s px-1">
        <div className="w-full h-[7%] bg-red-200s flex justify-between items-center border-b-[1px] px-3">
          <Link className="text-lg font-semibold" to="/dashboard">
            Chatty
          </Link>
          <RxHamburgerMenu
            className={cn("h-5 w-5 hover:cursor-pointer transition-colors hover:text-gray-400 lg:hidden")}
            onClick={toggleSidebar}
          />
        </div>

        <div className="flex flex-col bg-purple-200s h-[93%] pt-2">

          {/* Chat */}
          <div className="w-full h-[92%] flex-1 bg-green-300s">
            <div className="h-[90%]">
              <ChatList />
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="w-full bg-red-300s border-t-[1px] flex items-center justify-between bg-whites z-50 h-[8%] pt-2 px-3">
            {
              loading ? "" : (
                <div className="relative inline-block">
                  <UserSettingsModal>
                    <Avatar className="border-gray-300">
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