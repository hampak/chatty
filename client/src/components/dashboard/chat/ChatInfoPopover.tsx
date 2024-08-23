import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

const ChatInfoPopover = ({ children }: { children: React.ReactNode }) => {

  const [open, setOpen] = useState(false)

  useEffect(() => {
    const closeOnLargeScreen = () => {
      if (window.innerWidth >= 768) {
        // setTimeout(() => setOpen(false), 100)
        setOpen(false)
      }
    }

    window.addEventListener("resize", closeOnLargeScreen)

    closeOnLargeScreen()

    return () => window.removeEventListener("resize", closeOnLargeScreen)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="md:hidden">Place content for the popover here.</PopoverContent>
    </Popover>
  )
}

export default ChatInfoPopover