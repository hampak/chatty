import { useCreateChat } from "@/lib/data"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from 'react'
import { useForm } from "react-hook-form"
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5"
import { toast } from "sonner"
import { z } from "zod"
import { addFriendSchema } from "../../utils/zod"
import { useUser } from "../context/UserProvider"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"



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
      onSuccess: () => {
        setOpen(false)
        form.reset()
        queryClient.invalidateQueries({
          queryKey: ["chat_list", user?.id]
        })
        const name = friendUserTag.split("#")[0]
        toast.success(`Added ${name} as a friend :D`)
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
      <DialogTrigger className="w-full text-center">{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Start a new chat by adding a friend :D</DialogTitle>
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
                <Button
                  type="submit"
                  disabled={isPending}
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