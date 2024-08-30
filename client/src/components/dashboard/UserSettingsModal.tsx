import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import { Separator } from "../ui/separator"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { useUser } from "../context/UserProvider"
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5"
import { toast } from "sonner"
import { useState } from "react"
import { Button } from "../ui/button"

const UserSettingsModal = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser()
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        toast.success("Your user tag has been copied to the clipboard! You can share it with your friends :D")

        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      })
      .catch(() => {
        toast.error("Failed to copy your user tag to the clipboard :/")
      })
  }

  return (
    <Dialog>
      <DialogTrigger className="focus:outline-none">{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-xl font-bold">User Settings</DialogHeader>
        <Separator />
        <div className="space-y-2">
          <h1 className="text-gray-700 mb-3">Online Status</h1>
          <RadioGroup className="w-full">
            <label className="flex items-center hover:bg-green-100 px-2 py-4 rounded-lg transition-all" htmlFor="online">
              <div className="space-x-2 flex items-center">
                <RadioGroupItem value="online" id="online" className="h-3 w-3 bg-green-300 text-green-600 border-green-800" />
                <Label>Online</Label>
              </div>
              <p className="text-xs text-gray-600 ml-auto">Friends will know you're online</p>
            </label>
            <label className="flex items-center hover:bg-orange-100 px-2 py-4 rounded-lg transition-all" htmlFor="away">
              <div className="space-x-2 flex items-center">
                <RadioGroupItem value="away" id="away" className="h-3 w-3 bg-orange-300 text-orange-600 border-orange-800" />
                <Label>Away</Label>
              </div>
              <p className="text-xs text-gray-600 ml-auto">If you don't want to be bothered :D</p>
            </label>
          </RadioGroup>
        </div>
        <div>
          <h1 className="text-gray-700 mb-3">User Info</h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-800">Your user tag <span className="underline underline-offset-2">{user?.userTag}</span></span>
            {
              isCopied ? (
                <IoCheckmarkOutline
                  className="text-black"
                />
              ) : (
                <IoCopyOutline
                  className="hover:cursor-pointer text-gray-500 hover:text-black"
                  onClick={() => copyToClipboard(user?.userTag || "")}
                />
              )
            }
          </div>
        </div>
        <div className="flex w-full space-x-2 justify-end">
          <Button
            variant={"outline"}
          >
            Close
          </Button>
          <Button
            type="submit"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserSettingsModal