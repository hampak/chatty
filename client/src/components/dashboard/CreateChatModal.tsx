import { useForm } from "react-hook-form"
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
import { z } from "zod"
import { addFriendSchema } from "../../utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from 'react';
import { Button } from "../ui/button"
import { useUser } from "../context/UserProvider"
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { toast } from "sonner"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"



const CreateChatModal = ({ children }: { children: React.ReactNode }) => {

  const { user } = useUser()
  const queryClient = useQueryClient()

  const [isPending, startTransition] = useTransition()
  const [isCopied, setIsCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      friendUserTag: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {

    if (values.friendUserTag === user?.userTag) {
      return toast.error("Cannot befriend yourself :/")
    }

    startTransition(() => {
      try {
        axios.post('/api/chat/add-friend', {
          userId: user?.id,
          userName: user?.name,
          userTag: user?.userTag,
          userImage: user?.picture,
          friendUserTag: values.friendUserTag
        })
          .then((response) => {
            setOpen(false)
            form.reset()
            queryClient.invalidateQueries({
              queryKey: ["chat_list", user?.id]
            })
            const name = response.data.friendUserTag.split("#")[0]
            toast.success(`Added ${name} as a friend :D`)
          })
          .catch((error) => {
            toast.error(`${error.response.data.message}`)
          })
      } catch {
        toast.error("Couldn't add friend - please check if your friend's user tag is correct")
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