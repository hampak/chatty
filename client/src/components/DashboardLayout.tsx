import { Outlet } from "react-router-dom"
import Sidebar from "./dashboard/Sidebar"
import { useSidebarStore } from "@/utils/zustand"
import { RxHamburgerMenu } from "react-icons/rx"
import LogoutAlert from "./dashboard/LogoutAlert"
import { CiLogout } from "react-icons/ci"
import { cn } from "@/lib/utils"

const DashboardLayout = () => {

  const { isOpen, toggleSidebar } = useSidebarStore()

  return (
    <main className="w-full h-screen bg-red-200s flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="flex flex-col w-full">
          <div className={cn("md:hidden", isOpen ? "hidden" : "block w-full")}>
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
        </div>
        <Outlet />
      </div>
    </main>
  )
}

export default DashboardLayout