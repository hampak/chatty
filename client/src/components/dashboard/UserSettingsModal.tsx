import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import { Separator } from "../ui/separator"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { useUser } from "../provider/UserProvider"
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useSocket } from "../context/SocketContext"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

const UserSettingsModal = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser()
  const { currentStatus, socket } = useSocket()

  const [isCopied, setIsCopied] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"online" | "away" | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      status: currentStatus?.status
    }
  })

  const { isDirty } = form.formState
  const selectedStatusInForm = form.watch("status")

  useEffect(() => {
    setSelectedStatus(currentStatus?.status)
  }, [currentStatus])

  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedStatus(currentStatus?.status)
    }
  }, [open, setOpen, form, currentStatus?.status])

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

  const onSubmit = async (values: { status: "online" | "away" | undefined }) => {
    setIsLoading(true)
    socket.emit("changeStatus", values.status, user?.id)
    setTimeout(() => {
      setOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="focus:outline-none">{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-xl font-bold">User Settings</DialogHeader>
        <Separator />
        <div className="space-y-2">
          <h1 className="text-gray-700 mb-3">Online Status</h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        className="w-full"
                        defaultValue={currentStatus?.status}
                        onValueChange={(value: "online" | "away") => {
                          field.onChange(value)
                          setSelectedStatus(value)
                        }}
                      >
                        <label className={cn("flex items-center hover:bg-green-100 px-3 py-4 rounded-lg transition-all", selectedStatus === "online" && "bg-green-100")} htmlFor="online">
                          <div className="space-x-2 flex items-center">
                            <RadioGroupItem value="online" id="online" className="h-3 w-3 bg-green-300 text-green-600 border-green-800" />
                            <Label>Online</Label>
                          </div>
                          <p className="text-xs text-gray-600 ml-auto">Friends will know you're online :D</p>
                        </label>
                        <label className={cn("flex items-center hover:bg-orange-100 px-3 py-4 rounded-lg transition-all", selectedStatus === "away" && "bg-orange-100")} htmlFor="away">
                          <div className="space-x-2 flex items-center">
                            <RadioGroupItem value="away" id="away" className="h-3 w-3 bg-orange-300 text-orange-600 border-orange-800" />
                            <Label>Away</Label>
                          </div>
                          <p className="text-xs text-gray-600 ml-auto">If you don't want to be bothered :/</p>
                        </label>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
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
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={(!isDirty || selectedStatusInForm === currentStatus?.status) || isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default UserSettingsModal