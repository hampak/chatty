import { CiLogout } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import LogoutAlert from "../components/dashboard/LogoutAlert";
import Sidebar from "../components/dashboard/Sidebar";
import { cn } from "../lib/utils";
import { useSidebarStore } from "../utils/zustand";



const Dashboard = () => {

  const { isOpen, toggleSidebar } = useSidebarStore()

  return (
    <div className="bg-blue-100s h-full w-full">
      <div className={cn("md:hidden", isOpen ? "hidden" : "block")}>
        <div className="flex justify-between w-full items-center py-2 px-4 border-b">
          <RxHamburgerMenu
            className="h-5 w-5 hover:cursor-pointer transition-colors hover:text-gray-400"
            onClick={toggleSidebar}
          />
          <LogoutAlert>
            <CiLogout
              className="h-5 w-5 hover:cursor-pointer hover:text-gray-400 transition-colors"
            />
          </LogoutAlert>
        </div>
      </div>
      <Sidebar />
    </div>
  )
}

export default Dashboard