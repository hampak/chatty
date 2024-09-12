import { useCreateChat } from "@/lib/data"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from 'react'
import { useForm } from "react-hook-form"
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5"
import { toast } from "sonner"
import { z } from "zod"
import { addFriendSchema } from "@/utils/zod"
import { useUser } from "@/components/provider/UserProvider";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { socket } from "@/utils/io"



const CreateChatModal = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser()
  const queryClient = useQueryClient()
  const [isCopied, setIsCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      friendUserTag: ""
    }
  })

  const { mutate: createChat, isPending } = useCreateChat()

  const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {

    const friendUserTag = values.friendUserTag

    if (friendUserTag === user?.userTag) {
      return toast.error("Cannot befriend yourself :/")
    }

    createChat({
      userId: user?.id,
      userName: user?.name,
      userTag: user?.userTag,
      userImage: user?.picture,
      friendUserTag: friendUserTag
    }, {
      onSuccess: async (data) => {
        setOpen(false)
        form.reset()
        await queryClient.invalidateQueries({ queryKey: ["chat_list", user?.id] })
        toast.success(`Added ${data.friendUserTag} as a friend :D`)
        socket.emit("add-friend", user?.id)
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(`${error.response?.data.message}`)
          setTimeout(() => window.location.href = "/login", 1200)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full h-full flex items-center justify-center focus:outline-none">{children}</DialogTrigger>
      <DialogContent className="min-h-fit max-h-[400px]">
        <DialogHeader className="mb-4">
          <DialogTitle>Start a new chat</DialogTitle>
          <DialogDescription>You can start a 1 on 1 chat with a single friend or a group chat!</DialogDescription>
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
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                >
                  Start New Chat
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateChatModal