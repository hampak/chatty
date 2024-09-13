import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { FriendsList } from "@/types"
import { startChatWithFriendSchema } from "@/utils/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Checkbox } from "../ui/checkbox"



const CreateChatModal = ({ children, data }: { children: React.ReactNode, data: FriendsList | null }) => {

  // const { user } = useUser()
  // const queryClient = useQueryClient()
  // const [isCopied, setIsCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof startChatWithFriendSchema>>({
    resolver: zodResolver(startChatWithFriendSchema),
    defaultValues: {
      userId: []
    }
  })

  const onSubmit = (values: z.infer<typeof startChatWithFriendSchema>) => {
    alert(values.userId)
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
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <>
                    {
                      Array.isArray(data) && data.length > 0 ? (
                        data.map(f => {
                          const isChecked = field.value.includes(f.userId)
                          return (
                            <FormItem
                              className="px-3 py-2 w-full flex items-center justify-between bg-red-200s rounded-lg hover:bg-gray-100 transition-all space-y-0 cursor-pointer"
                              key={f.userId}
                            >
                              <FormLabel className="flex items-center bg-green-200s w-full cursor-pointer">
                                <Avatar className="mr-3">
                                  <AvatarImage
                                    src={f.image}
                                  />
                                </Avatar>
                                <h2>
                                  {f.name}
                                </h2>
                              </FormLabel>
                              <FormControl>
                                <Checkbox
                                  className=""
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, f.userId]); // Add userId to the list
                                    } else {
                                      field.onChange(
                                        field.value.filter((id) => id !== f.userId) // Remove userId from the list
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )
                        })
                      ) : (
                        <></>
                      )
                    }
                  </>
                )}
              />
              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  // disabled={isPending}
                  className="w-full mt-4"
                >
                  Start New Chat
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog >
  )
}

export default CreateChatModal


// const { mutate: createChat, isPending } = useCreateChat()

//   const onSubmit = async (values: z.infer<typeof addFriendSchema>) => {

//     const friendUserTag = values.friendUserTag

//     if (friendUserTag === user?.userTag) {
//       return toast.error("Cannot befriend yourself :/")
//     }

//     createChat({
//       userId: user?.id,
//       userName: user?.name,
//       userTag: user?.userTag,
//       userImage: user?.picture,
//       friendUserTag: friendUserTag
//     }, {
//       onSuccess: async (data) => {
//         setOpen(false)
//         form.reset()
//         await queryClient.invalidateQueries({ queryKey: ["chat_list", user?.id] })
//         toast.success(`Added ${data.friendUserTag} as a friend :D`)
//         socket.emit("add-friend", user?.id)
//       },
//       onError: (error) => {
//         if (error instanceof AxiosError) {
//           toast.error(`${error.response?.data.message}`)
//           setTimeout(() => window.location.href = "/login", 1200)
//         } else {
//           toast.error(error.message)
//         }
//       }
//     })
//   }