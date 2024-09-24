import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/utils/zustand"
import { CiLogout } from "react-icons/ci"
import { RxHamburgerMenu } from "react-icons/rx"
import { Outlet } from "react-router-dom"
import LogoutAlert from "./dashboard/LogoutAlert"
import Sidebar from "./dashboard/Sidebar"

const DashboardLayout = () => {

  const { isOpen, toggleSidebar } = useSidebarStore()

  return (
    <main className="max-w-full h-screen bg-red-200s flex">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="flex flex-col w-full">
          <div className={cn("lg:hidden h-10 bg-blue-200s", isOpen ? "hidden" : "block w-full")}>
            <div className="flex justify-between w-full items-center py-2 px-4 border-b h-full">
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