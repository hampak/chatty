import { useEffect, useState } from "react"
import { useSidebarStore } from "../../utils/zustand"
import { cn } from "../../lib/utils"
import { RxHamburgerMenu } from "react-icons/rx"

const Sidebar = () => {

  const { isOpen, toggleSidebar, closeSidebar, openSidebar } = useSidebarStore()

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
      <div className={cn("md:hidden w-full bg-red-300s h-[25px]", isOpen ? "flex justify-end items-center" : "hidden")}>
        <RxHamburgerMenu
          className="h-5 w-5 hover:cursor-pointer transition-colors hover:text-gray-400"
          onClick={toggleSidebar}
        />
      </div>

    </div>
  )
}

export default Sidebar