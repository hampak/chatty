import { useAddFriend } from "@/lib/data"
import { addFriendSchema } from "@/utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5"
import { toast } from "sonner"
import { z } from "zod"
import { useUser } from "../provider/UserProvider"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { socket } from "@/utils/io"
import { useSocket } from "../context/SocketContext"

const AddFriendModal = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser()
  const { currentStatus } = useSocket()
  const queryClient = useQueryClient()
  const [isCopied, setIsCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      friendUserTag: ""
    }
  })

  const { mutate: addFriend, isPending } = useAddFriend()

  const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {

    const friendUserTag = values.friendUserTag

    if (friendUserTag === user?.userTag) {
      return toast.error("Cannot befriend yourself :/")
    }

    addFriend({
      userId: user?.id,
      friendUserTag: friendUserTag
    }, {
      onSuccess: async (data) => {
        setOpen(false)
        form.reset()
        await queryClient.invalidateQueries({ queryKey: ["friend_list", user?.id] })
        toast.success(`Added ${data.friendName} as a friend :D`)
        socket.emit("add-friend", data.friendId, user?.id, currentStatus?.socketId, currentStatus?.status)
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response!.status === 401) {
            toast.error(`${error.response?.data.message}`)
            setTimeout(() => window.location.href = "/login", 1200)
          } else {
            toast.error(`${error.response?.data.message}`)
          }
        } else {
          toast.error(error.message)
        }
      }
    })
  }

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

  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full h-full flex items-center justify-center">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Add a new friend</DialogTitle>
          <DialogDescription>When adding your friends user tag, be sure to paste it correctly!</DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="friendUserTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Friend's User Tag</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usertag#12345"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="mr-2">Your user tag</span>
                  <span className="underline underline-offset-2 mr-2">{user?.userTag}</span>
                  {
                    isCopied ? (
                      <IoCheckmarkOutline
                        className="text-green-700"
                      />
                    ) : (
                      <IoCopyOutline
                        className="hover:cursor-pointer text-gray-500 hover:text-black"
                        onClick={() => copyToClipboard(user?.userTag || "")}
                      />
                    )
                  }
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  Add Friend
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <p className="text-xs text-red-600">
          <span className="font-semibold underline">Please Read!!</span> As this is a portfolio project of mine, you may be here just to test my app out (maybe you're a recruiter? 👀). In that case, this is my user tag. Feel free to add me as your friend so you can test this app 😊
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendModal